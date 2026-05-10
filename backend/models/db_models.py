from __future__ import annotations

import uuid
from datetime import datetime, date as pydate
from decimal import Decimal
from typing import Optional, List, Any

from pgvector.sqlalchemy import Vector
from sqlalchemy import (
    Boolean,
    Date,
    DateTime,
    ForeignKey,
    Index,
    Numeric,
    String,
    func,
)
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


def new_id() -> str:
    return str(uuid.uuid4())


class Base(DeclarativeBase):
    pass


class User(Base):
    __tablename__ = "users"

    # Firebase UID — up to 128 chars
    id: Mapped[str] = mapped_column(String(128), primary_key=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[Optional[str]] = mapped_column(String(255), unique=True, nullable=True)
    currency: Mapped[str] = mapped_column(String(10), nullable=False, default="USD")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    ledgers: Mapped[List["Ledger"]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan",
    )


class Ledger(Base):
    __tablename__ = "ledgers"
    __table_args__ = (
        Index("idx_ledgers_user_id", "user_id"),
    )

    id: Mapped[str] = mapped_column(
        PGUUID(as_uuid=False), primary_key=True, default=new_id
    )
    user_id: Mapped[str] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    name: Mapped[str] = mapped_column(String(50), nullable=False)
    icon: Mapped[str] = mapped_column(String(30), nullable=False, default="wallet")
    is_default: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
        server_default="false",
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    user: Mapped["User"] = relationship(back_populates="ledgers")
    expenses: Mapped[List["Expense"]] = relationship(
        back_populates="ledger",
        cascade="all, delete-orphan",
    )


class Expense(Base):
    __tablename__ = "expenses"
    __table_args__ = (
        Index("idx_expenses_ledger_id", "ledger_id"),
        Index("idx_expenses_date", "date"),
        Index("idx_expenses_ledger_date", "ledger_id", "date"),
        Index("idx_expenses_ledger_category", "ledger_id", "category"),
        Index(
            "idx_expenses_embedding",
            "embedding",
            postgresql_using="hnsw",
            postgresql_ops={"embedding": "vector_cosine_ops"},
            postgresql_where="embedding IS NOT NULL",  # partial index — skip NULLs
        ),
    )

    id: Mapped[str] = mapped_column(
        PGUUID(as_uuid=False), primary_key=True, default=new_id
    )
    ledger_id: Mapped[str] = mapped_column(
        ForeignKey("ledgers.id", ondelete="CASCADE"),
        nullable=False,
    )

    # Numeric avoids float precision loss on currency values
    amount: Mapped[Decimal] = mapped_column(Numeric(precision=12, scale=2), nullable=False)
    category: Mapped[str] = mapped_column(String(30), nullable=False)
    note: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    date: Mapped[pydate] = mapped_column(Date, nullable=False, default=pydate.today)
    source: Mapped[str] = mapped_column(String(10), nullable=False, default="voice")

    # Any bypasses SQLAlchemy type introspection that chokes on List[float]
    embedding: Mapped[Optional[Any]] = mapped_column(Vector(384), nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=func.now(),         # ORM-level (e.g. in-memory / test inserts)
        server_default=func.now(),  # DB-level default on INSERT
        onupdate=func.now(),        # DB-level update on UPDATE
    )

    ledger: Mapped["Ledger"] = relationship(back_populates="expenses")