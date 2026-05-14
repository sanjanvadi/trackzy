from datetime import datetime, date as Date, timedelta
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException
from sentence_transformers import SentenceTransformer

from models.db_models import User, Ledger, Expense
from models.schemas import ExpenseToolInput, CategoryBreakdown, ExpenseSummary, ExpenseCreate, ExpenseUpdate
from core.logging import get_logger

logger = get_logger(__name__)

DEFAULT_LEDGERS = [
    {"name": "Personal", "icon": "home",      "is_default": True},
    {"name": "Business", "icon": "briefcase", "is_default": False},
]

model = SentenceTransformer("all-MiniLM-L6-v2")

def get_embedding(text: str) -> list[float]:
    if not text:
        return model.encode("empty").tolist()
    return model.encode(text, normalize_embeddings=True).tolist()

# ── Users ──────────────────────────────────────────────────────────────────────

async def get_user(db: AsyncSession, uid: str) -> User | None:
    try:
        result = await db.execute(
            select(User).where(User.id == uid)
        )
        return result.scalar_one_or_none()

    except Exception as e:
        logger.exception(e)
        raise HTTPException(
            status_code=500,
            detail="Could not fetch user"
        )
    
async def create_or_update_user(
    db: AsyncSession,
    uid: str,
    data: dict
) -> User:

    try:
        result = await db.execute(
            select(User).where(User.id == uid)
        )

        user = result.scalar_one_or_none()

        # UPDATE EXISTING USER
        if user:
            for k, v in data.items():
                if v is not None and hasattr(user, k):
                    setattr(user, k, v)

        # CREATE NEW USER
        else:
            user = User(id=uid, **data)

            db.add(user)

            await db.flush()

            # Create default ledgers
            for l in DEFAULT_LEDGERS:
                ledger = Ledger(
                    user_id=uid,
                    **l
                )
                db.add(ledger)

        await db.commit()
        await db.refresh(user)

        return user

    except Exception as e:
        await db.rollback()

        logger.exception(e)

        raise HTTPException(
            status_code=500,
            detail="Could not create/update user"
        )

async def delete_user(
    db: AsyncSession,
    uid: str
) -> None:

    try:
        result = await db.execute(
            select(User).where(User.id == uid)
        )

        user = result.scalar_one_or_none()

        if not user:
            raise HTTPException(
                status_code=404,
                detail="User not found"
            )

        await db.delete(user)

        await db.commit()

    except HTTPException:
        raise

    except Exception as e:
        await db.rollback()

        logger.exception(e)

        raise HTTPException(
            status_code=500,
            detail="Could not delete user"
        )
    
# ── Ledgers ────────────────────────────────────────────────────────────────────

async def get_ledgers(db: AsyncSession, uid: str) -> list[Ledger]:
    try:
        result = await db.execute(
            select(Ledger)
            .where(Ledger.user_id == uid)
            .order_by(Ledger.created_at)
        )

        return result.scalars().all()

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Could not retrieve ledgers: {str(e)}"
        )


async def get_ledger(
    db: AsyncSession,
    uid: str,
    ledger_id: str
) -> Ledger:
    try:
        result = await db.execute(
            select(Ledger).where(
                Ledger.id == ledger_id,
                Ledger.user_id == uid
            )
        )

        ledger = result.scalar_one_or_none()

        if not ledger:
            raise HTTPException(
                status_code=404,
                detail="Ledger not found"
            )

        return ledger

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Could not retrieve ledger: {str(e)}"
        )


async def create_ledger(
    db: AsyncSession,
    uid: str,
    name: str,
    icon: str = "wallet",
    is_default: bool = False,
) -> Ledger:
    try:
        ledger = Ledger(
            user_id=uid,
            name=name,
            icon=icon,
            is_default=is_default,
        )

        db.add(ledger)

        await db.commit()
        await db.refresh(ledger)

        return ledger

    except Exception as e:
        await db.rollback()

        raise HTTPException(
            status_code=500,
            detail=f"Could not create ledger: {str(e)}"
        )


async def update_ledger(
    db: AsyncSession,
    uid: str,
    ledger_id: str,
    data: dict,
) -> Ledger:
    try:
        ledger = await get_ledger(db, uid, ledger_id)

        for key, value in data.items():
            if value is not None and hasattr(ledger, key):
                setattr(ledger, key, value)

        await db.commit()
        await db.refresh(ledger)

        return ledger

    except HTTPException:
        raise

    except Exception as e:
        await db.rollback()

        raise HTTPException(
            status_code=500,
            detail=f"Could not update ledger: {str(e)}"
        )


async def set_default_ledger(
    db: AsyncSession,
    uid: str,
    ledger_id: str
) -> None:
    """
    Atomically set one ledger as default
    and clear all others.
    """

    try:
        ledger = await get_ledger(db, uid, ledger_id)

        # Remove existing defaults
        await db.execute(
            update(Ledger)
            .where(Ledger.user_id == uid)
            .values(is_default=False)
        )

        # Set selected ledger as default
        ledger.is_default = True

        await db.commit()

    except HTTPException:
        raise

    except Exception as e:
        await db.rollback()

        raise HTTPException(
            status_code=500,
            detail=f"Could not set default ledger: {str(e)}"
        )


async def delete_ledger(
    db: AsyncSession,
    uid: str,
    ledger_id: str
) -> None:
    try:
        ledger = await get_ledger(db, uid, ledger_id)

        if ledger.is_default:
            raise HTTPException(
                status_code=400,
                detail=(
                    "Cannot delete the default ledger. "
                    "Set another as default first."
                )
            )

        ledgers = await get_ledgers(db, uid)

        if len(ledgers) <= 1:
            raise HTTPException(
                status_code=400,
                detail="Cannot delete the only remaining ledger."
            )

        await db.delete(ledger)

        await db.commit()

    except HTTPException:
        raise

    except Exception as e:
        await db.rollback()

        raise HTTPException(
            status_code=500,
            detail=f"Could not delete ledger: {str(e)}"
        )


async def resolve_ledger_id(
    db: AsyncSession,
    uid: str,
    args: ExpenseToolInput,
) -> str | None:
    """
    Resolve which ledger to use from LLM output.

    Never trusts ledger_id from client.
    Always resolves server-side by name.

    Fallback:
    1. Matching ledger name
    2. Default ledger
    3. First ledger
    """

    try:
        ledgers = await get_ledgers(db, uid)

        if not ledgers:
            return None

        # Match by name
        if args.ledger_name:
            ledger_name = args.ledger_name.lower()

            for ledger in ledgers:
                if ledger.name.lower() == ledger_name:
                    return str(ledger.id)

        # Default ledger
        for ledger in ledgers:
            if ledger.is_default:
                return str(ledger.id)

        # First ledger fallback
        return str(ledgers[0].id)

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Could not resolve ledger: {str(e)}"
        )
  
# ── Expenses ───────────────────────────────────────────────────────────────────

async def get_expense(
    db: AsyncSession,
    uid: str,
    ledger_id: str,
    expense_id: str,
) -> Expense:
    """
    Fetch a single expense
    while verifying ledger ownership.
    """

    try:
        # Verify ledger ownership
        await get_ledger(db, uid, ledger_id)

        result = await db.execute(
            select(Expense).where(
                Expense.id == expense_id,
                Expense.ledger_id == ledger_id
            )
        )

        expense = result.scalar_one_or_none()

        if not expense:
            raise HTTPException(
                status_code=404,
                detail="Expense not found"
            )

        return expense

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Could not fetch expense: {str(e)}"
        )


async def list_expenses(
    db: AsyncSession,
    uid: str,
    ledger_id: str,
    start_date: str | None = None,
    end_date: str | None = None,
    category: str | None = None,
    page: int = 1,
    per_page: int = 20,
) -> list[Expense]:

    try:
        # Verify ownership
        await get_ledger(db, uid, ledger_id)

        query = select(Expense).where(
            Expense.ledger_id == ledger_id
        )

        # Filters
        if start_date:
            query = query.where(
                Expense.date >= start_date
            )

        if end_date:
            query = query.where(
                Expense.date <= end_date
            )

        if category and category != "all":
            query = query.where(
                Expense.category == category
            )

        # Pagination + sorting
        query = (
            query
            .order_by(Expense.date.desc())
            .offset((page - 1) * per_page)
            .limit(per_page)
        )

        result = await db.execute(query)

        return result.scalars().all()

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Could not list expenses: {str(e)}"
        )


async def create_expense_db(
    db: AsyncSession,
    ledger_id: str,
    data: ExpenseCreate,
) -> Expense:

    try:
        data_dict = data.model_dump()

        note = data_dict.get("note")

        embedding = (
            get_embedding(note)
            if note
            else None
        )

        expense = Expense(
            ledger_id=ledger_id,
            embedding=embedding,
            **data_dict
        )

        db.add(expense)

        await db.commit()
        await db.refresh(expense)

        logger.info(
            f"Created expense {expense.id} "
            f"in ledger {ledger_id}"
        )

        return expense

    except Exception as e:
        await db.rollback()

        raise HTTPException(
            status_code=500,
            detail=f"Could not create expense: {str(e)}"
        )


async def update_expense_db(
    db: AsyncSession,
    uid: str,
    ledger_id: str,
    expense_id: str,
    data: dict,
) -> Expense:

    try:
        expense = await get_expense(
            db,
            uid,
            ledger_id,
            expense_id
        )

        for key, value in data.items():

            if value is not None and hasattr(expense, key):
                setattr(expense, key, value)

        # Recompute embedding if note changed
        if data.get("note"):
            expense.embedding = get_embedding(
                data["note"]
            )

        expense.updated_at = datetime.utcnow()

        await db.commit()
        await db.refresh(expense)

        return expense

    except HTTPException:
        raise

    except Exception as e:
        await db.rollback()

        raise HTTPException(
            status_code=500,
            detail=f"Could not update expense: {str(e)}"
        )


async def delete_expense_db(
    db: AsyncSession,
    uid: str,
    ledger_id: str,
    expense_id: str,
) -> None:

    try:
        expense = await get_expense(
            db,
            uid,
            ledger_id,
            expense_id
        )

        await db.delete(expense)

        await db.commit()

        logger.info(
            f"Deleted expense {expense_id}"
        )

    except HTTPException:
        raise

    except Exception as e:
        await db.rollback()

        raise HTTPException(
            status_code=500,
            detail=f"Could not delete expense: {str(e)}"
        )


async def find_matching_expenses(
    db: AsyncSession,
    uid: str,
    ledger_id: str,
    args: ExpenseToolInput,
) -> list[Expense]:

    try:
        # Verify ledger ownership
        await get_ledger(db, uid, ledger_id)

        # ─────────────────────────────────────────────────────────────
        # Semantic retrieval using pgvector
        # ─────────────────────────────────────────────────────────────

        query = select(Expense).where(
            Expense.ledger_id == ledger_id
        )

        if args.note:

            query_embedding = get_embedding(
                args.note
            )

            query = query.order_by(
                Expense.embedding.op("<=>")(
                    query_embedding
                )
            )

        query = query.limit(10)

        result = await db.execute(query)

        expenses = result.scalars().all()

        if not expenses:
            return []

        # ─────────────────────────────────────────────────────────────
        # Hybrid scoring
        # ─────────────────────────────────────────────────────────────

        scored: list[tuple[int, Expense]] = []

        for expense in expenses:

            score = 0

            # Amount match
            if args.amount is not None:

                if abs(expense.amount - args.amount) < 0.01:
                    score += 5

                elif (
                    abs(expense.amount - args.amount)
                    / max(expense.amount, 1)
                ) < 0.1:
                    score += 2

            # Category match
            if args.category:

                if expense.category == args.category:
                    score += 3

            # Date match
            if args.date:

                if expense.date == args.date:
                    score += 4
            if score>0:
                scored.append((score, expense))

        # Highest score first
        scored.sort(
            key=lambda x: x[0],
            reverse=True
        )

        # Return top 3
        return [
            expense
            for _, expense in scored[:3]
        ]

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Could not lookup expense: {str(e)}"
        )
 
# ── Summary / reporting ────────────────────────────────────────────────────────

def _date_range(period: str) -> tuple[Date | None, Date | None]:
    today = Date.today()
    if period == "today":
        return today, today
    elif period == "this_week":
        start = today - timedelta(days=today.weekday())
        return start, today
    elif period == "this_month":
        return today.replace(day=1), today
    elif period == "last_month":
        first_this = today.replace(day=1)
        last_prev  = first_this - timedelta(days=1)
        return last_prev.replace(day=1), last_prev
    return None, None  # "all"

async def get_expense_summary(
    db: AsyncSession,
    uid: str,
    ledger_id: str,
    period: str,
    category: str,
    currency: str,
) -> ExpenseSummary:

    try:
        # Verify ledger ownership
        await get_ledger(db, uid, ledger_id)

        start, end = _date_range(period)

        query = select(Expense).where(
            Expense.ledger_id == ledger_id
        )

        # Date filters
        if start:
            query = query.where(
                Expense.date >= start
            )

        if end:
            query = query.where(
                Expense.date <= end
            )

        # Category filter
        if category and category != "all":
            query = query.where(
                Expense.category == category
            )

        result = await db.execute(query)

        expenses = result.scalars().all()

        # ─────────────────────────────────────────────────────────────
        # Aggregate totals
        # ─────────────────────────────────────────────────────────────

        totals: dict[str, float] = {}
        counts: dict[str, int] = {}

        for expense in expenses:

            totals[expense.category] = round(
                totals.get(expense.category, 0)
                + expense.amount,
                2
            )

            counts[expense.category] = (
                counts.get(expense.category, 0)
                + 1
            )

        # ─────────────────────────────────────────────────────────────
        # Build breakdown
        # ─────────────────────────────────────────────────────────────

        breakdown = sorted(
            [
                CategoryBreakdown(
                    category=cat,
                    total=totals[cat],
                    count=counts[cat],
                )
                for cat in totals
            ],
            key=lambda item: item.total,
            reverse=True,
        )

        # ─────────────────────────────────────────────────────────────
        # Response
        # ─────────────────────────────────────────────────────────────

        return ExpenseSummary(
            period=period,
            total=round(sum(totals.values()), 2),
            count=len(expenses),
            currency=currency,
            breakdown=breakdown,
        )

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Could not fetch expense summary: {str(e)}"
        )