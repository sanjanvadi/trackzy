import json
import re
from enum import Enum
from datetime import date as dt
from typing import Any
from groq import Groq

from core.config import GROQ_API_KEY
from core.logging import get_logger
from models.schemas import IntentResponse, ExpenseToolInput

logger = get_logger(__name__)
client = Groq(api_key=GROQ_API_KEY)

MAX_TRANSCRIPT_CHARS = 500

# ── Tool definitions ───────────────────────────────────────────────────────────

TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "add_expense",
            "description": (
                "Use when the user reports ANY new purchase, payment, or spending event. "
                "Trigger words: add, paid, spent, bought, had, got, ordered, purchased. "
                "'paid X for Y' and 'spent X on Y' are ALWAYS add_expense with no exceptions. "
                "Do NOT use if the user is explicitly correcting or modifying an existing expense."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "amount": {"type": ["number", "string"]},
                    "category": {
                        "type": "string",
                        "enum": ["food", "transport", "shopping", "health", "entertainment", "bills", "other"],
                    },
                    "note": {"type": "string"},
                    "date": {"type": "string"},
                    "ledger_name": {"type": "string"},
                },
                "required": ["amount", "category", "note"],
                "additionalProperties": False,
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "edit_expense",
            "description": (
                "Use ONLY when the user explicitly wants to modify or correct an EXISTING expense. "
                "Requires explicit correction language: change, update, fix, make it, move, instead, correct, edit, wrong. "
                "Do NOT use if the user says 'paid', 'spent', 'add' or 'bought' — those are always add_expense. "
                "Do NOT use just because the note matches a past expense name. "
                "An amount + item description alone is never a correction."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "amount": {"type": ["number", "string"]},
                    "category": {
                        "type": "string",
                        "enum": ["food", "transport", "shopping", "health", "entertainment", "bills", "other"],
                    },
                    "note": {"type": "string"},
                    "date": {"type": "string"},
                    "ledger_name": {"type": "string"},
                },
                "required": ["note", "category"],
                "additionalProperties": False,
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "delete_expense",
            "description": (
                "Use ONLY when the user explicitly wants to remove an expense. "
                "Keywords: delete, remove, undo, cancel, erase."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "note": {"type": "string"},
                    "date": {"type": "string"},
                    "ledger_name": {"type": "string"},
                },
                "required": ["note"],
                "additionalProperties": False,
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "query_expenses",
            "description": (
                "Use ONLY when the user is asking a question about their past spending. "
                "Keywords: how much, total, summary, show me, what did I spend."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "period": {
                        "type": "string",
                        "enum": ["today", "this_week", "this_month", "last_month", "all"],
                    },
                    "category": {
                        "type": "string",
                        "enum": ["food", "transport", "shopping", "health", "entertainment", "bills", "other"],
                    },
                    "ledger_name": {"type": "string"},
                },
                "required": ["period"],
                "additionalProperties": False,
            },
        },
    },
]


STATIC_RULES = """
You are an expense tracking assistant. Classify the user intent and call exactly ONE tool. You cannot create ledgers.

Intent rules:
- "paid X for Y", "spent X on Y", "bought X for Y" → ALWAYS add_expense, no exceptions
- ANY new transaction with an amount + item → add_expense
- ONLY use edit_expense if user says: change, update, fix, make it, instead, correct, edit, wrong
- delete/remove/undo/cancel/erase → delete_expense
- how much/total/summary/show me/what did I spend → query_expenses

Critical rules:
- "paid X for Y" is ALWAYS add_expense — never edit_expense, even if Y matches a past expense name
- The presence of an amount + item description = new expense, not a correction
- edit_expense requires explicit correction language — an amount alone is NOT correction language
- Do NOT use edit_expense unless modification intent is explicit
- If user provides a number, treat it as amount unless explicitly stated otherwise
- Use YYYY-MM-DD for dates. Resolve relative dates (yesterday, last Friday, today) to actual dates
- Keep notes short (max 5 words)
- No ledger mentioned or unknown ledger → use default_ledger
- Never include fields with null values — omit unknown fields entirely
- Always attempt best-effort tool call using partial information
- Currency words (rupees, dollars, euros, INR, USD) are part of the amount — extract the number only

Category inference:
- coffee, food, restaurant, grocery, groceries, lunch, dinner, breakfast, snack → food
- uber, taxi, ola, cab, flight, bus, metro, auto, rickshaw → transport
- clothes, shoes, watch, amazon, mall, shirt, shopping → shopping
- medicines, doctor, vitamins, dental, pharmacy, hospital → health
- movie, netflix, concert, gaming, spotify, stream → entertainment
- electricity, internet, water, phone bill, rent, recharge → bills

Examples:
User: "lost 200 in a casino"
Tool: add_expense({"amount": 200, "category": "entertainment", "note": "casino", "date": "2024-01-15"})

User: "i paid 300 rupees for cab today"
Tool: add_expense({"amount": 300, "category": "transport", "note": "cab", "date": "2024-01-15"})

User: "paid 50 for lunch"
Tool: add_expense({"amount": 50, "category": "food", "note": "lunch", "date": "2024-01-15"})

User: "spent 200 on medicines"
Tool: add_expense({"amount": 200, "category": "health", "note": "medicines", "date": "2024-01-15"})

User: "bought shoes for 1500"
Tool: add_expense({"amount": 1500, "category": "shopping", "note": "shoes", "date": "2024-01-15"})

User: "coffee 5 dollars"
Tool: add_expense({"amount": 5, "category": "food", "note": "coffee", "date": "2024-01-15"})

User: "make that 10 instead"
Tool: edit_expense({"amount": 10, "category": "other", "note": "last expense"})

User: "change the category to transport for the 2000 flight expense"
Tool: edit_expense({"amount": 2000, "category": "transport", "note": "flight"})

User: "convert my cab expense to transport category"
Tool: edit_expense({"category": "transport", "note": "cab"})

User: "delete last expense"
Tool: delete_expense({"note": "last expense"})

User: "how much did I spend today"
Tool: query_expenses({"period": "today"})

User: "total spending this month"
Tool: query_expenses({"period": "this_month"})
"""

class Intent(str, Enum):
    ADD = "add_expense"
    EDIT = "edit_expense"
    DELETE = "delete_expense"
    QUERY = "query_expenses"
    UNKNOWN = "unknown"

ADD_KEYWORDS = {
    "add",
    "added",
    "spent",
    "spend",
    "paid",
    "pay",
    "bought",
    "buy",
    "purchase",
    "purchased",
    "ordered",
    "booked",
    "charged",
    "cost me",
    "paid for",
    "spent on",
    "bought for",
    "sent",
    "transferred",
    "lent",
    "gave"
}

EDIT_KEYWORDS = {
    "change the",
    "change my",
    "update the",
    "update my",
    "edit the",
    "edit my",
    "modify the",
    "modify my",
    "correct the",
    "correct my",
    "fix the amount",
    "fix the category",
    "fix the date",
    "make it",
    "set it to",
    "replace with",
    "rename"
}

DELETE_KEYWORDS = {
    "delete",
    "remove",
    "undo",
    "cancel",
    "erase",
    "discard",
    "clear"
}

QUERY_KEYWORDS = {
    "how much",
    "total",
    "summary",
    "summarize",
    "show me",
    "show my",
    "what did i spend",
    "where did i spend",
    "list my expenses",
    "find my expenses",
    "search expenses",
    "expenses for",
    "spending for"
}

def preclassify_intent(text: str) -> Intent:
    text = text.lower().strip()

    # 1. DELETE (highest priority)
    if any(k in text for k in DELETE_KEYWORDS):
        return Intent.DELETE

    # 2. QUERY
    if any(k in text for k in QUERY_KEYWORDS):
        return Intent.QUERY

    # 3. ADD (important rule: amount + context strongly biases ADD)
    if any(k in text for k in ADD_KEYWORDS):
        return Intent.ADD

    # 4. EDIT (must be explicit correction language)
    if any(k in text for k in EDIT_KEYWORDS):
        return Intent.EDIT

    return Intent.UNKNOWN


def parse_voice_intent(
    transcript: str,
    default_ledger: str,
    currency: str = "USD",
    ledger_names: list[str] | None = None,
) -> IntentResponse:
    transcript = transcript.strip()[:MAX_TRANSCRIPT_CHARS]
    ledger_tuple = tuple(ledger_names or [])

    system_prompt = (
        STATIC_RULES
        + f"\nToday's date is {dt.today().isoformat()}."
        + f"\ndefault_ledger = {default_ledger}."
        + f"\nAvailable ledgers = {ledger_tuple}."
        + f"\nUser currency = {currency}."
    )

    logger.info(f"Parsing transcript: '{transcript[:80]}'")

    try:
        response = client.chat.completions.create(
            model="openai/gpt-oss-20b",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": transcript},
            ],
            tools=TOOLS,
            tool_choice="required",
            max_tokens=1024,
            temperature=0.1,
        )
    except Exception as e:
        logger.error(f"LLM call failed: {e}")
        raise

    tool_calls = response.choices[0].message.tool_calls
    if not tool_calls:
        raise ValueError("LLM did not return a tool call.")

    tool_call = tool_calls[0]
    intent = tool_call.function.name
    manual_intent = preclassify_intent(transcript)
    raw_args: dict[str, Any] = json.loads(tool_call.function.arguments)

    if intent!=manual_intent:
        logger.warning(f"!!!!!!INTENT MISSCLASSIFIED!!!!!!!!: Intent: {intent}: transcript: {transcript}")
    
    if manual_intent!="unknown":
        intent = manual_intent

    # Default date for add_expense if not extracted
    if intent == "add_expense" and not raw_args.get("date"):
        logger.info("Date not extracted by model — defaulting to today.")
        raw_args["date"] = dt.today().isoformat()

    # Coerce amount to float
    amount = raw_args.get("amount")
    if amount is not None:
        try:
            raw_args["amount"] = float(amount)
        except (ValueError, TypeError):
            logger.warning(f"Could not coerce amount '{amount}' to float — dropping field.")
            raw_args.pop("amount", None)

    # Strip null values and hallucinated fields
    clean_args: dict[str, Any] = {k: v for k, v in raw_args.items() if v is not None}
    clean_args.pop("ledger_id", None)

    logger.info(f"Intent: {intent} | args: {clean_args}")

    return IntentResponse(
        intent=intent,
        tool_input=ExpenseToolInput(**clean_args),
        raw_transcript=transcript,
    )