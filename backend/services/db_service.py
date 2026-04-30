from datetime import date as Date, timedelta
from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException

from models.db_models import User, Ledger, Expense, ExpenseCreate, ExpenseUpdate
from models.schemas import ExpenseToolInput, CategoryBreakdown, ExpenseSummary
from core.logging import get_logger

logger = get_logger(__name__)

DEFAULT_LEDGERS = [
    {"name": "Personal", "icon": "home",      "is_default": True},
    {"name": "Business", "icon": "briefcase", "is_default": False},
]

# ── Users ──────────────────────────────────────────────────────────────────────

async def get_user(db: AsyncSession, uid: str) -> User | None:
    return await db.get(User, uid)

async def create_or_update_user(db: AsyncSession, uid: str, data: dict) -> User:
    user = await db.get(User, uid)
    if user:
        # Update existing — only name and currency are changeable
        for k, v in data.items():
            if v is not None and hasattr(user, k):
                setattr(user, k, v)
    else:
        user = User(id=uid, **data)
        db.add(user)

        await db.flush() 
        # Create default ledgers for new users
        for l in DEFAULT_LEDGERS:
            ledger = Ledger(user_id=uid, **l)
            db.add(ledger)
    await db.commit()
    await db.refresh(user)
    return user

async def delete_user(db: AsyncSession, uid: str) -> None:
    """Delete user + all ledgers + all expenses via cascade."""
    user = await db.get(User, uid)
    if user:
        await db.delete(user)
        await db.commit()

# ── Ledgers ────────────────────────────────────────────────────────────────────

async def get_ledgers(db: AsyncSession, uid: str) -> list[Ledger]:
    result = await db.execute(
        select(Ledger)
        .where(Ledger.user_id == uid)
        .order_by(Ledger.created_at)
    )
    return result.scalars().all()

async def get_ledger(db: AsyncSession, uid: str, ledger_id: str) -> Ledger:
    ledger = await db.get(Ledger, ledger_id)
    if not ledger or ledger.user_id != uid:
        raise HTTPException(status_code=404, detail="Ledger not found.")
    return ledger

async def create_ledger(
    db: AsyncSession,
    uid: str,
    name: str,
    icon: str = "wallet",
    is_default: bool = False,
) -> Ledger:
    ledger = Ledger(user_id=uid, name=name, icon=icon, is_default=is_default)
    db.add(ledger)
    await db.commit()
    await db.refresh(ledger)
    return ledger

async def update_ledger(
    db: AsyncSession,
    uid: str,
    ledger_id: str,
    data: dict,
) -> Ledger:
    ledger = await get_ledger(db, uid, ledger_id)
    for k, v in data.items():
        if v is not None:
            setattr(ledger, k, v)
    await db.commit()
    await db.refresh(ledger)
    return ledger

async def set_default_ledger(db: AsyncSession, uid: str, ledger_id: str) -> None:
    """Atomically set one ledger as default, clear all others."""
    ledgers = await get_ledgers(db, uid)
    for l in ledgers:
        l.is_default = l.id == ledger_id
    await db.commit()

async def delete_ledger(db: AsyncSession, uid: str, ledger_id: str) -> None:
    ledger = await get_ledger(db, uid, ledger_id)

    if ledger.is_default:
        raise HTTPException(
            status_code=400,
            detail="Cannot delete the default ledger. Set another as default first."
        )

    ledgers = await get_ledgers(db, uid)
    if len(ledgers) <= 1:
        raise HTTPException(
            status_code=400,
            detail="Cannot delete the only remaining ledger."
        )

    await db.delete(ledger)
    await db.commit()

async def resolve_ledger_id(
    db: AsyncSession,
    uid: str,
    args: ExpenseToolInput,
) -> str | None:
    """
    Resolve which ledger to use from LLM output.
    Never trusts ledger_id from client — always resolves server-side by name.
    Falls back to is_default=True, then first ledger.
    """
    ledgers = await get_ledgers(db, uid)
    if not ledgers:
        return None

    if args.ledger_name:
        name_lower = args.ledger_name.lower()
        for l in ledgers:
            if l.name.lower() == name_lower:
                return l.id

    for l in ledgers:
        if l.is_default:
            return l.id

    return ledgers[0].id

# ── Expenses ───────────────────────────────────────────────────────────────────

async def get_expense(
    db: AsyncSession,
    uid: str,
    ledger_id: str,
    expense_id: str,
) -> Expense:
    """Fetch a single expense, verifying ledger ownership."""
    await get_ledger(db, uid, ledger_id)   # ownership check
    expense = await db.get(Expense, expense_id)
    if not expense or expense.ledger_id != ledger_id:
        raise HTTPException(status_code=404, detail="Expense not found.")
    return expense

async def list_expenses(
    db:         AsyncSession,
    uid:        str,
    ledger_id:  str,
    start_date: str | None = None,
    end_date:   str | None = None,
    category:   str | None = None,
    page:       int = 1,
    per_page:   int = 20,
) -> list[Expense]:
    await get_ledger(db, uid, ledger_id)   # ownership check

    query = select(Expense).where(Expense.ledger_id == ledger_id)

    if start_date:
        query = query.where(Expense.date >= start_date)
    if end_date:
        query = query.where(Expense.date <= end_date)
    if category and category != "all":
        query = query.where(Expense.category == category)

    query = (
        query
        .order_by(Expense.date.desc())
        .offset((page - 1) * per_page)
        .limit(per_page)
    )

    result = await db.execute(query)
    return result.scalars().all()

async def create_expense_db(
    db:        AsyncSession,
    ledger_id: str,
    data:      ExpenseCreate,
) -> Expense:
    expense = Expense(ledger_id=ledger_id, **data.model_dump())
    db.add(expense)
    await db.commit()
    await db.refresh(expense)
    logger.info(f"Created expense {expense.id} in ledger {ledger_id}")
    return expense

async def update_expense_db(
    db:         AsyncSession,
    uid:        str,
    ledger_id:  str,
    expense_id: str,
    data:       dict,
) -> Expense:
    expense = await get_expense(db, uid, ledger_id, expense_id)
    from datetime import datetime
    for k, v in data.items():
        if v is not None and hasattr(expense, k):
            setattr(expense, k, v)
    expense.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(expense)
    return expense

async def delete_expense_db(
    db:         AsyncSession,
    uid:        str,
    ledger_id:  str,
    expense_id: str,
) -> None:
    expense = await get_expense(db, uid, ledger_id, expense_id)
    await db.delete(expense)
    await db.commit()
    logger.info(f"Deleted expense {expense_id}")

async def find_matching_expenses(
    db:        AsyncSession,
    uid:       str,
    ledger_id: str,
    args:      ExpenseToolInput,
) -> list[Expense]:
    """
    Fuzzy lookup by date + category in SQL, then note keyword in Python.
    Used by voice edit/delete when no expense_id is confirmed yet. 
    """
    await get_ledger(db, uid, ledger_id)

    query = select(Expense).where(Expense.ledger_id == ledger_id)

    if args.date:
        query = query.where(Expense.date == args.date)
    if args.category:
        query = query.where(Expense.category == args.category)

    query = query.order_by(Expense.date.desc()).limit(50)
    result = await db.execute(query)
    expenses = result.scalars().all()

    # Note keyword filter — SQL has no fuzzy text search, done in Python
    if args.note:
        keyword  = args.note.lower()
        expenses = [e for e in expenses if keyword in (e.note or "").lower()]

    return expenses

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
    db:        AsyncSession,
    uid:       str,
    ledger_id: str,
    period:    str,
    category:  str,
    currency:  str,
) -> ExpenseSummary:
    start, end = _date_range(period)
    # logger.info(start,end)
    print(start,end) 
    query = select(Expense).where(Expense.ledger_id == ledger_id)

    if start:
        query = query.where(Expense.date >= start)
    if end:
        query = query.where(Expense.date <= end)
    if category and category != "all":
        query = query.where(Expense.category == category)

    result   = await db.execute(query)
    expenses = result.scalars().all()

    totals: dict[str, float] = {}
    counts: dict[str, int]   = {}
    for e in expenses:
        totals[e.category] = round(totals.get(e.category, 0) + e.amount, 2)
        counts[e.category] = counts.get(e.category, 0) + 1

    breakdown = sorted(
        [CategoryBreakdown(category=c, total=totals[c], count=counts[c]) for c in totals],
        key=lambda x: x.total,
        reverse=True,
    )

    return ExpenseSummary(
        period=period,
        total=round(sum(totals.values()), 2),
        count=len(expenses),
        currency=currency,
        breakdown=breakdown,
    )
