from pydantic import BaseModel
from typing import Optional, Literal
from datetime import datetime, date as Date

Category = Literal["food", "transport", "shopping", "health", "entertainment", "bills","grocery", "other"]
Intent   = Literal["add_expense", "edit_expense", "delete_expense", "query_expenses"]
Period   = Literal["today", "this_week", "this_month", "last_month", "all"]

# ── Summary / reporting ────────────────────────────────────────────────────────

class CategoryBreakdown(BaseModel):
    category: str
    total:    float
    count:    int

class ExpenseSummary(BaseModel):
    period:    str
    total:     float
    count:     int
    currency:  str
    breakdown: list[CategoryBreakdown]

# ── LLM tool input ─────────────────────────────────────────────────────────────

class ExpenseToolInput(BaseModel):
    expense_id:  Optional[str]      = None
    ledger_name: Optional[str]      = None
    amount:      Optional[float]    = None
    category:    Optional[str] = None
    note:        Optional[str]      = None
    date:        Optional[Date]      = None
    period:      Optional[str]   = None

class IntentResponse(BaseModel):
    intent:         Intent
    tool_input:     ExpenseToolInput
    raw_transcript: str

# ── Voice API response ─────────────────────────────────────────────────────────

class VoiceParseResponse(BaseModel):
    intent:     Intent
    ledger_id:  Optional[str]            = None
    message:    str
    tool_input: ExpenseToolInput
    expense:    Optional[dict]           = None
    candidates: Optional[list[dict]]    = None
    summary:    Optional[ExpenseSummary] = None
