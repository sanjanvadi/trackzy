import json
from datetime import date
from functools import lru_cache
from typing import Any
from groq import Groq

from core.config import GROQ_API_KEY
from core.logging import get_logger
from models.schemas import IntentResponse, ExpenseToolInput

logger = get_logger(__name__)
client = Groq(api_key=GROQ_API_KEY)

MAX_TRANSCRIPT_CHARS = 500

# ── Tool definitions (OpenAI / Groq format) ────────────────────────────────────

TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "add_expense",
            "description": "Add a new expense. Triggered by: 'I spent', 'add', 'I bought', 'paid for'.",
            "parameters": {
                "type": "object",
                "properties": {
                    "amount":      {"type": "number",  "description": "Expense amount in user's currency."},
                    "category":    {"type": "string",  "enum": ["food","transport","shopping","health","entertainment","bills","other"]},
                    "note":        {"type": "string",  "description": "Short description, max 5 words."},
                    "date":        {"type": "string",  "description": "YYYY-MM-DD. Use today if not specified."},
                    "ledger_name": {"type": "string",  "description": "Ledger name the user mentioned."},
                },
                "required": ["amount", "category", "date"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "edit_expense",
            "description": "Edit an expense. Triggered by: 'change', 'update', 'correct', 'fix'.",
            "parameters": {
                "type": "object",
                "properties": {
                    "expense_id":  {"type": "string",  "description": "Leave null — backend resolves."},
                    "ledger_name": {"type": "string"},
                    "amount":      {"type": "number"},
                    "category":    {"type": "string",  "enum": ["food","transport","shopping","health","entertainment","bills","other"]},
                    "note":        {"type": "string"},
                    "date":        {"type": "string",  "description": "YYYY-MM-DD."},
                },
                "required": [],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "delete_expense",
            "description": "Delete an expense. Triggered by: 'remove', 'delete', 'undo'.",
            "parameters": {
                "type": "object",
                "properties": {
                    "expense_id":  {"type": "string",  "description": "Leave null — backend resolves."},
                    "ledger_name": {"type": "string"},
                    "note":        {"type": "string"},
                    "date":        {"type": "string"},
                },
                "required": [],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "query_expenses",
            "description": "Summarise expenses. Triggered by: 'how much did I spend', 'total', 'summary'.",
            "parameters": {
                "type": "object",
                "properties": {
                    "period":      {"type": "string",  "enum": ["today","this_week","this_month","last_month","all"]},
                    "category":    {"type": "string",  "enum": ["food","transport","shopping","health","entertainment","bills","other","all"]},
                    "ledger_name": {"type": "string"},
                },
                "required": ["period"],
            },
        },
    },
]

# ── Cached prompt builder ──────────────────────────────────────────────────────
# lru_cache memoises by (currency, ledger_names_tuple) — same combo returns
# the cached string instantly without rebuilding. Rebuilds only when either changes.

STATIC_RULES = """
Handle expense actions only — add, edit, delete, or query. Cannot create ledgers.
Rules:
- Always call exactly ONE tool.
- Resolve relative dates (yesterday, last Friday) to YYYY-MM-DD.
- No ledger mentioned or unknown → use default ledger.
- Always include ledger_name in every tool call.
- Call the tool even if fields are missing — leave them null.
- Keep notes under 5 words.
"""

@lru_cache(maxsize=256)
def _build_cached_prompt(currency: str, ledger_names_tuple: tuple[str, ...]) -> str:
    ledger_list    = ", ".join(ledger_names_tuple)
    default_ledger = ledger_names_tuple[0] if ledger_names_tuple else "Personal"
    return (
        f"You are an expense tracking assistant.\n"
        f"User currency: {currency}.\n"
        f"User ledgers: {ledger_list}.\n"
        f"Default ledger: {default_ledger}.\n"
        f"{STATIC_RULES}"
    )

def parse_voice_intent(
    transcript:   str,
    currency:     str = "USD",
    ledger_names: list[str] | None = None,
) -> IntentResponse:
    transcript    = transcript.strip()[:MAX_TRANSCRIPT_CHARS]
    ledger_tuple  = tuple(ledger_names or ["Personal"])

    # Date prepended per-request (cannot cache — changes every day)
    system_prompt = (
        f"Today's date is {date.today().isoformat()}.\n"
        + _build_cached_prompt(currency, ledger_tuple)
    )

    logger.info(f"Parsing: '{transcript[:80]}'")
    logger.info(f"Parsing: '{system_prompt}'")

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user",   "content": transcript},
        ],
        tools=TOOLS,
        tool_choice="required",
        max_tokens=1024,
        temperature=0,
    )
    print(response)

    tool_calls = response.choices[0].message.tool_calls
    if not tool_calls:
        raise ValueError("LLM did not return a tool call.")

    tool_call = tool_calls[0]
    intent    = tool_call.function.name
    raw_args: dict[str, Any] = json.loads(tool_call.function.arguments)
    raw_args.pop("ledger_id", None)   # strip if hallucinated

    logger.info(f"Intent: {intent} | args: {raw_args}")

    return IntentResponse(
        intent=intent,
        tool_input=ExpenseToolInput(**raw_args),
        raw_transcript=transcript,
    )
