from sqlmodel import SQLModel, Field
from sqlalchemy import Index, Column, String, Boolean, DateTime, func
from pgvector.sqlalchemy import Vector
from typing import Optional, List, Any, Annotated
from datetime import datetime, date as Date
import uuid
from models.schemas import Category

def new_id() -> str:
    return str(uuid.uuid4())

# ── Users ──────────────────────────────────────────────────────────────────────

class UserBase(SQLModel):
    name:       str     = Field(min_length=1, max_length=100)
    email: Optional[str] = Field(default=None, sa_column=Column(String(255), unique=True, nullable=True))
    currency:   str     = Field(default="USD", max_length=10)

class User(UserBase, table=True):
    __tablename__ = "users"

    # id = Firebase Auth UID — no auto-generated key needed
    id:         str      = Field(primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)

class UserCreate(UserBase):
    pass   # uid comes from verified token, not request body 

class UserUpdate(SQLModel):
    name:     Optional[str] = Field(default=None, min_length=1, max_length=100)
    currency: Optional[str] = Field(default=None, max_length=10)

class UserRead(UserBase):
    id:         str
    created_at: datetime

# ── Ledgers ────────────────────────────────────────────────────────────────────

class LedgerBase(SQLModel):
    name:       str  = Field(min_length=1, max_length=50)
    icon:       str  = Field(default="wallet", max_length=30)
    is_default: bool = Field(
    default=False,
    sa_column=Column(Boolean, nullable=False, server_default="false")
)

class Ledger(LedgerBase, table=True):
    __tablename__ = "ledgers"
    __table_args__ = (
        Index("idx_ledgers_user_id", "user_id"),
    )

    id:         str      = Field(default_factory=new_id, primary_key=True)
    user_id:    str      = Field(foreign_key="users.id", ondelete="CASCADE", nullable=False)
    created_at: datetime = Field(default_factory=datetime.utcnow) 

class LedgerCreate(LedgerBase):
    pass

class LedgerUpdate(SQLModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=50)
    icon: Optional[str] = Field(default=None, max_length=30)

class LedgerRead(LedgerBase):
    id:         str
    user_id:    str
    created_at: datetime

# ── Expenses ───────────────────────────────────────────────────────────────────

class ExpenseBase(SQLModel):
    amount:   float  = Field(gt=0)
    category: Category    = Field(max_length=30)
    note:     Optional[str] = Field(default=None, max_length=200)
    date:     Date    = Field(default_factory=Date.today)   # YYYY-MM-DD
    source:   str    = Field(default="voice", max_length=10)

class Expense(ExpenseBase, table=True):
    __tablename__ = "expenses"
    __table_args__ = (
        # Composite indexes for the most common query patterns
        Index("idx_expenses_ledger_id",       "ledger_id"),
        Index("idx_expenses_date",            "date"),
        Index("idx_expenses_ledger_date",     "ledger_id", "date"),
        Index("idx_expenses_ledger_category", "ledger_id", "category"),
        Index(
            "idx_expenses_embedding",
            "embedding",
            postgresql_using="hnsw",
            postgresql_ops={"embedding": "vector_cosine_ops"}
        ),
    )

    id:         str      = Field(default_factory=new_id, primary_key=True)
    ledger_id:  str      = Field(foreign_key="ledgers.id", ondelete="CASCADE", nullable=False)

    embedding: Optional[Any] = Field(
        sa_column=Column(Vector(384), nullable=True)
    )


    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(
        sa_column=Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)
    )

class ExpenseCreate(ExpenseBase):
    embedding: Optional[list[float]] = None

class ExpenseUpdate(SQLModel):
    amount:   Optional[float] = Field(default=None, gt=0)
    category: Optional[Category]   = Field(default=None, max_length=30)
    note:     Optional[str]   = Field(default=None, max_length=200)
    date:     Optional[Date]   = None
    embedding: Optional[list[float]] = None

class ExpenseRead(ExpenseBase):
    id:         str
    ledger_id:  str
    created_at: datetime
    updated_at: datetime
