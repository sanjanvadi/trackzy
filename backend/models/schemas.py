from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator, AfterValidator
from decimal import Decimal
from typing import Optional, Literal, Annotated
from datetime import datetime, date as Date

Category = Literal["food", "transport", "shopping", "health", "entertainment", "bills","grocery", "other"]
Intent   = Literal["add_expense", "edit_expense", "delete_expense", "query_expenses"]
Period   = Literal["today", "this_week", "this_month", "last_month", "all"]

class BaseSchema(BaseModel):
    pass


class BaseReadSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)


# ── Embedding type with dimension validation ──────────────────────────────────

def _check_embedding_dim(v: Optional[list[float]]) -> Optional[list[float]]:
    if v is not None and len(v) != 384:
        raise ValueError(f"Embedding must have 384 dimensions, got {len(v)}")
    return v

Embedding384 = Annotated[Optional[list[float]], AfterValidator(_check_embedding_dim)]


# ── Users ─────────────────────────────────────────────────────────────────────

class UserBase(BaseSchema):
    name: str = Field(..., min_length=1, max_length=100)
    email: Optional[EmailStr] = None
    # DB enforces UNIQUE on email; two users with email=None are both permitted by schema
    currency: str = Field(default="USD", min_length=3, max_length=3)

    @field_validator("currency")
    @classmethod
    def validate_currency(cls, v: str) -> str:
        if not v.isalpha() or not v.isupper():
            raise ValueError("Currency must be a 3-letter ISO 4217 code (e.g. USD)")
        return v


class UserCreate(UserBase):
    pass


class UserUpdate(BaseSchema):
    name: Optional[str] = Field(default=None, min_length=1, max_length=100)
    currency: Optional[str] = Field(default=None, min_length=3, max_length=3)

    @field_validator("currency")
    @classmethod
    def validate_currency(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and (not v.isalpha() or not v.isupper()):
            raise ValueError("Currency must be a 3-letter ISO 4217 code (e.g. USD)")
        return v


class UserRead(UserBase, BaseReadSchema):
    id: str
    created_at: datetime


# ── Ledgers ───────────────────────────────────────────────────────────────────

class LedgerBase(BaseSchema):
    name: str = Field(..., min_length=1, max_length=50)
    icon: str = Field(default="wallet", max_length=30)
    is_default: bool = False


class LedgerCreate(LedgerBase):
    pass


class LedgerUpdate(BaseSchema):
    name: Optional[str] = Field(default=None, min_length=1, max_length=50)
    icon: Optional[str] = Field(default=None, max_length=30)
    is_default: Optional[bool] = None


class LedgerRead(LedgerBase, BaseReadSchema):
    id: str
    user_id: str
    created_at: datetime


# ── Expenses ──────────────────────────────────────────────────────────────────

class ExpenseBase(BaseSchema):
    amount: Decimal = Field(..., gt=Decimal("0.01"))
    category: Category
    note: Optional[str] = Field(default=None, max_length=200)
    date: Date = Field(default_factory=Date.today)
    source: str = Field(default="voice", max_length=10)


class ExpenseCreate(ExpenseBase):
    pass


class ExpenseUpdate(BaseSchema):
    amount: Optional[Decimal] = Field(default=None, gt=Decimal("0.01"))
    category: Optional[Category] = None
    note: Optional[str] = Field(default=None, max_length=200)
    date: Optional[Date] = None
    source: Optional[str] = Field(default=None, max_length=10)


class ExpenseRead(ExpenseBase, BaseReadSchema):
    id: str
    ledger_id: str
    created_at: datetime
    updated_at: datetime

# ── Summary / reporting ────────────────────────────────────────────────────────

class CategoryBreakdown(BaseModel):
    category: str
    total:    float
    count:    int

class ExpenseSummary(BaseModel):
    period:    str
    total:     Decimal
    count:     int
    currency:  str
    breakdown: list[CategoryBreakdown]

# ── LLM tool input ─────────────────────────────────────────────────────────────

class ExpenseToolInput(BaseModel):
    expense_id:  Optional[str]      = None
    ledger_name: Optional[str]      = None
    amount:      Optional[Decimal]    = None
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
    ExpenseBase:    Optional[dict]           = None
    candidates: Optional[list[dict]]    = None
    summary:    Optional[ExpenseSummary] = None
