import json

from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import date as dt

from core.database import get_db
from middleware.auth import get_current_uid
from models.schemas import VoiceParseResponse, ExpenseToolInput
from models.db_models import ExpenseCreate
from services.llm_service import parse_voice_intent
from services.whisper_service import transcribe_audio
from services.db_service import (
    get_user, get_ledgers, resolve_ledger_id,
    create_expense_db, update_expense_db, delete_expense_db,
    find_matching_expenses, get_expense_summary,
)

router = APIRouter(prefix="/voice", tags=["voice"])


def _expense_to_dict(expense) -> dict:
    """Convert SQLModel Expense to a plain dict for the API response."""
    return {
        "id":         expense.id,
        "ledger_id":  expense.ledger_id,
        "amount":     expense.amount,
        "category":   expense.category,
        "note":       expense.note,
        "date":       expense.date,
        "source":     expense.source,
        "created_at": expense.created_at.isoformat() if expense.created_at else None,
        "updated_at": expense.updated_at.isoformat() if expense.updated_at else None,
    }


@router.post("/parse", response_model=VoiceParseResponse)
async def parse_voice(
    audio: UploadFile    = File(...),
    uid:   str           = Depends(get_current_uid),
    db:    AsyncSession  = Depends(get_db),
):
    # ── 1. Load user context ──────────────────────────────────────────────────
    user = await get_user(db, uid)
    if not user:
        raise HTTPException(status_code=404, detail="User profile not found.")

    currency     = user.currency
    ledgers      = await get_ledgers(db, uid)
    ledger_names = [l.name for l in ledgers]
    default_ledger = next(
        (l.name for l in ledgers if l.is_default),
        "Personal"
    )



    # ── 2. Transcribe audio via Groq Whisper ──────────────────────────────────
    transcript = await transcribe_audio(audio)
    transcript = transcript[:500]

    if not transcript:
        raise HTTPException(status_code=422, detail="Could not detect speech in audio.")

    # ── 3. Parse intent via Groq LLM ──────────────────────────────────────────
    try:
        intent_result = parse_voice_intent(
            transcript,
            default_ledger=default_ledger,
            currency=currency,
            ledger_names=ledger_names,
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Intent parsing failed: {e}")

    intent = intent_result.intent
    args   = intent_result.tool_input

    # ── 4. Resolve ledger server-side — never trust client/LLM ID ─────────────
    ledger_id = await resolve_ledger_id(db, uid, args)
    if not ledger_id:
        raise HTTPException(status_code=422, detail="No ledgers found for this user.")

    # ── 5. Execute intent ─────────────────────────────────────────────────────

    # ── ADD ───────────────────────────────────────────────────────────────────
    if intent == "add_expense":
        if args.amount is None:
            raise HTTPException(status_code=422, detail="Could not extract amount from speech.")

        payload = ExpenseCreate(
            amount=args.amount,
            category=args.category or "other",
            note=args.note,
            date=args.date or dt.today(),
            source="voice",
        )
        expense = await create_expense_db(db, ledger_id, payload)

        return VoiceParseResponse(
            intent=intent,
            ledger_id=ledger_id,
            message=f"Added {expense.category} expense of {expense.amount} {currency}.",
            tool_input=args,
            expense=_expense_to_dict(expense),
        )

    # ── EDIT ──────────────────────────────────────────────────────────────────
    elif intent == "edit_expense":
        ALLOWED_UPDATE_FIELDS = {"amount", "category", "note", "date"}

        update_fields = {
            k: v
            for k, v in args.model_dump().items()
            if k in ALLOWED_UPDATE_FIELDS and v is not None
        }

        if "amount" in update_fields and update_fields["amount"] <= 0:
            del update_fields["amount"]

        if not update_fields:
            return VoiceParseResponse(
                intent=intent,
                message="Nothing to update.",
                tool_input=args,
            )


        # Second pass — frontend confirmed exact expense_id after seeing candidates
        if args.expense_id:
            expense = await update_expense_db(
                db, uid, ledger_id, args.expense_id, update_fields
            )
            return VoiceParseResponse(
                intent=intent,
                ledger_id=ledger_id,
                message="Expense updated.",
                tool_input=args,
                expense=_expense_to_dict(expense),
            )

        # First pass — fuzzy search by date / category / note
        matches = await find_matching_expenses(db, uid, ledger_id, args)

        if not matches:
            return VoiceParseResponse(
                intent=intent,
                message="No matching expense found. Try saying the date or category.",
                tool_input=args,
                candidates=[],
            )

        if len(matches) == 1:
            expense = await update_expense_db(
                db, uid, ledger_id, matches[0].id, update_fields
            )
            return VoiceParseResponse(
                intent=intent,
                ledger_id=ledger_id,
                message="Expense updated.",
                tool_input=args,
                expense=_expense_to_dict(expense),
            )

        # Multiple matches — return candidates for user to confirm in UI
        return VoiceParseResponse(
            intent=intent,
            ledger_id=ledger_id,
            message="Found multiple matching expenses. Which one did you mean?",
            tool_input=args,
            candidates=[_expense_to_dict(m) for m in matches],
        )

    # ── DELETE ────────────────────────────────────────────────────────────────
    elif intent == "delete_expense":

        # Second pass — confirmed ID from frontend
        if args.expense_id:
            await delete_expense_db(db, uid, ledger_id, args.expense_id)
            return VoiceParseResponse(
                intent=intent,
                ledger_id=ledger_id,
                message="Expense deleted.",
                tool_input=args,
            )

        # First pass — fuzzy search
        matches = await find_matching_expenses(db, uid, ledger_id, args)

        if not matches:
            return VoiceParseResponse(
                intent=intent,
                message="No matching expense found. Try saying the date or category.",
                tool_input=args,
                candidates=[],
            )

        if len(matches) == 1:
            expense_dict = _expense_to_dict(matches[0])
            await delete_expense_db(db, uid, ledger_id, matches[0].id)
            return VoiceParseResponse(
                intent=intent,
                ledger_id=ledger_id,
                message="Expense deleted.",
                tool_input=args,
                expense=expense_dict,
            )

        return VoiceParseResponse(
            intent=intent,
            ledger_id=ledger_id,
            message="Found multiple matching expenses. Which one should I delete?",
            tool_input=args,
            candidates=[_expense_to_dict(m) for m in matches],
        )

    # ── QUERY ─────────────────────────────────────────────────────────────────
    elif intent == "query_expenses":
        period   = args.period or "this_month"
        category = args.category or "all"

        summary = await get_expense_summary(
            db, uid, ledger_id, period, category, currency
        )

        period_label = period.replace("_", " ")
        cat_label    = f"{category} " if category != "all" else ""
        message      = f"You spent {summary.total} {currency} on {cat_label}expenses {period_label}."

        return VoiceParseResponse(
            intent=intent,
            ledger_id=ledger_id,
            message=message,
            tool_input=args,
            summary=summary,
        )

    raise HTTPException(status_code=400, detail="Unknown intent.")
