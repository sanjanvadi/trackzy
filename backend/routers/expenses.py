from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from datetime import date as Date

from core.database import get_db
from middleware.auth import get_current_uid
from models.schemas import ExpenseCreate, ExpenseUpdate, ExpenseRead
from models.schemas import ExpenseSummary, Period, Category
from services.db_service import (
    list_expenses, get_expense,
    create_expense_db, update_expense_db,
    delete_expense_db, get_expense_summary,
    get_user,
)

router = APIRouter(prefix="/ledgers/{ledger_id}/expenses", tags=["expenses"])


@router.get("", response_model=list[ExpenseRead])
async def list_expenses_endpoint(
    ledger_id:  str,
    uid:        str           = Depends(get_current_uid),
    db:         AsyncSession  = Depends(get_db),
    page:       int           = Query(1,    ge=1),
    per_page:   int           = Query(20,   ge=1, le=100),
    start_date: Optional[Date] = Query(None, description="dateFormat"),
    end_date:   Optional[Date] = Query(None, description="dateFormat"),
    category:   Optional[Category] = Query(None),
    sorting:    Optional[str] = 'date',
):
    """
    List expenses for a ledger.
    Supports pagination and filtering by date range and category.
    Results ordered by date descending.
    """
    return await list_expenses(
        db, uid, ledger_id,
        start_date=start_date,
        end_date=end_date,
        category=category,
        page=page,
        per_page=per_page,
        sorting=sorting,
    )


@router.get("/summary", response_model=ExpenseSummary)
async def get_summary_endpoint(
    ledger_id: str,
    uid:       str          = Depends(get_current_uid),
    db:        AsyncSession = Depends(get_db),
    period:    str          = Query("this_month", description="today|this_week|this_month|last_month|all"),
    category:  str          = Query("all"),
):
    """
    Return total spend, count, and per-category breakdown for a period.
    Used by the frontend for charts and the dashboard.
    """
    user     = await get_user(db, uid)
    currency = user.currency if user else "USD"
    return await get_expense_summary(db, uid, ledger_id, period, category, currency)


@router.post("", response_model=ExpenseRead, status_code=201)
async def create_expense_endpoint(
    ledger_id: str,
    payload:   ExpenseCreate,
    uid:       str          = Depends(get_current_uid),
    db:        AsyncSession = Depends(get_db),
):
    """Manually add an expense (non-voice). source is set to 'manual'."""
    from services.db_service import get_ledger
    await get_ledger(db, uid, ledger_id)   # verify ownership

    data         = payload.model_dump()
    data["source"] = "manual"
    create_payload = ExpenseCreate(**data)
    return await create_expense_db(db, ledger_id, create_payload)


@router.get("/{expense_id}", response_model=ExpenseRead)
async def get_expense_endpoint(
    ledger_id:  str,
    expense_id: str,
    uid:        str          = Depends(get_current_uid),
    db:         AsyncSession = Depends(get_db),
):
    """Fetch a single expense by ID."""
    return await get_expense(db, uid, ledger_id, expense_id)


@router.patch("/{expense_id}", response_model=ExpenseRead)
async def update_expense_endpoint(
    ledger_id:  str,
    expense_id: str,
    payload:    ExpenseUpdate,
    uid:        str          = Depends(get_current_uid),
    db:         AsyncSession = Depends(get_db),
):
    """Manually edit an expense field."""
    updates = {k: v for k, v in payload.model_dump().items() if v is not None}
    return await update_expense_db(db, uid, ledger_id, expense_id, updates)


@router.delete("/{expense_id}", status_code=204)
async def delete_expense_endpoint(
    ledger_id:  str,
    expense_id: str,
    uid:        str          = Depends(get_current_uid),
    db:         AsyncSession = Depends(get_db),
):
    """Delete an expense."""
    await delete_expense_db(db, uid, ledger_id, expense_id)
