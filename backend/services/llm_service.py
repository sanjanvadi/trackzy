import json
from datetime import date as dt
# from functools import lru_cache
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
            "description": "Create expense",
            "parameters": {
                "type": "object",
                "properties": {
                    "amount": {"type": ["number","string"]},
                    "category": {"type": "string", "enum": ["food","transport","shopping","health","entertainment","bills","other"]},
                    "note": {"type": "string"},
                    "date": {"type": "string"},
                    "ledger_name": {"type": "string"},
                },
                "required": ["amount", "category"],
                "additionalProperties": False,
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "edit_expense",
            "description": "Update expense",
            "parameters": {
                "type": "object",
                "properties": {
                    "amount": {"type": ["number","string"]},
                    "category": {"type": "string", "enum": ["food","transport","shopping","health","entertainment","bills","other","all"]},
                    "note": {"type": "string"},
                    "date": {"type": "string"},
                    "ledger_name": {"type": "string"},
                },
                "required": [],
                "additionalProperties": False
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "delete_expense",
            "description": "Delete expense",
            "parameters": {
                "type": "object",
                "properties": {
                    "note": {"type": "string"},
                    "date": {"type": "string"},
                    "ledger_name": {"type": "string"},
                },
                "required": [],
                "additionalProperties": False
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "query_expenses",
            "description": "Get summary",
            "parameters": {
                "type": "object",
                "properties": {
                    "period": {"type": "string", "enum": ["today","this_week","this_month","last_month","all"]},
                    "category": {"type": "string", "enum": ["food","transport","shopping","health","entertainment","bills","other","all"]},
                    "ledger_name": {"type": "string"},
                },
                "required": ["period"],
                "additionalProperties": False
            },
        },
    },
]


STATIC_RULES= """
You are an expense assistant.

Classify the user intent and call exactly ONE tool. Cannot create ledgers.

Intent rules:
- New spending (e.g., "spent", "paid", "bought") → add_expense
- Corrections (e.g., "change", "update", "instead", "make it") → edit_expense
- Deletions (e.g., "delete", "remove", "undo") → delete_expense
- Questions (e.g., "how much", "total", "summary") → query_expenses

Strict rules:
- If the user describes a new expense, ALWAYS use add_expense.
- Infer category from common keywords:
  coffee, food, restaurant → food
  uber, taxi, flight → transport
  groceries, fruits, vegetables → grocery
- Always return valid tool arguments.
- No ledger mentioned or unknown → use default ledger.
- Use YYYY-MM-DD for dates. Resolve relative dates (yesterday, last Friday) to YYYY-MM-DD.
- Keep notes short (max 5 words).
- Only include fields that are explicitly mentioned or strongly implied.
- If a field is unknown, OMIT it completely.
- NEVER return null values.

Examples:
"I spent 20 on food" → add_expense
"coffee 5 dollars" → add_expense
"make that 10 instead" → edit_expense
"delete last expense" → delete_expense
"how much did I spend today" → query_expenses

Example:
"change the category to transport for the 2000 rupees flight expense"

Tool:
edit_expense({
  "amount": 2000,
  "category": "transport",
  "note": "flight",
  "ledger_name": "Personal"
})


"""

def parse_voice_intent(
    transcript:   str,
    default_ledger: str,
    currency:     str = "USD",
    ledger_names: list[str] | None = None,
) -> IntentResponse:
    transcript    = transcript.strip()[:MAX_TRANSCRIPT_CHARS]
    ledger_tuple  = tuple(ledger_names or [])
    
    system_prompt = (
        f"Today's date is {dt.today().isoformat()}.\n"
        +f"default_ledger = {default_ledger}.\n"
        +f"ledgers = {ledger_tuple}."
    )

    logger.info(f"Parsing: '{transcript[:80]}'")
    logger.info(f"Parsing: '{system_prompt}'")

    response = client.chat.completions.create(
        model="meta-llama/llama-4-scout-17b-16e-instruct",
        messages=[
            {"role": "system", "content": STATIC_RULES},
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
    raw_args = json.loads(tool_call.function.arguments)

    if intent == "add_expense":
        raw_args["date"] = raw_args["date"] or dt.today()

    clean_args: dict[str, Any] = {k: v for k, v in raw_args.items() if v is not None}

    clean_args.pop("ledger_id", None)   # strip if hallucinated

    logger.info(f"Intent: {intent} | args: {raw_args}")

    return IntentResponse(
        intent=intent,
        tool_input=ExpenseMutationInput(**clean_args),
        raw_transcript=transcript,
    )
