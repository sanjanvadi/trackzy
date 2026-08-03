from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from middleware.auth import get_current_uid
from models.schemas import LedgerCreate, LedgerUpdate, LedgerRead
from services.db_service import (
    get_ledgers, get_ledger, create_ledger,
    update_ledger, delete_ledger, set_default_ledger,
)

router = APIRouter(prefix="/ledgers", tags=["ledgers"])


@router.get("", response_model=list[LedgerRead])
async def list_ledgers(
    uid: str          = Depends(get_current_uid),
    db:  AsyncSession = Depends(get_db),
):
    """Return all ledgers for the current user, ordered by creation date."""
    return await get_ledgers(db, uid)


@router.post("", response_model=LedgerRead, status_code=201)
async def create_ledger_endpoint(
    payload: LedgerCreate,
    uid:     str          = Depends(get_current_uid),
    db:      AsyncSession = Depends(get_db),
):
    """Create a new ledger. e.g. 'Trip to Hawaii', 'Freelance', 'Side project'."""
    return await create_ledger(db, uid, payload.name, payload.icon)


@router.patch("/{ledger_id}", response_model=LedgerRead)
async def update_ledger_endpoint(
    ledger_id: str,
    payload:   LedgerUpdate,
    uid:       str          = Depends(get_current_uid),
    db:        AsyncSession = Depends(get_db),
):
    """Rename a ledger or change its icon."""
    updates = {k: v for k, v in payload.model_dump(exclude_unset=True).items() if v is not None}
    return await update_ledger(db, uid, ledger_id, updates)


@router.patch("/{ledger_id}/set-default", response_model=list[LedgerRead])
async def set_default_endpoint(
    ledger_id: str,
    uid:       str          = Depends(get_current_uid),
    db:        AsyncSession = Depends(get_db),
):
    """
    Set a ledger as the default.
    The default is used when the user doesn't mention a ledger in voice input.
    Clears is_default on all other ledgers atomically.
    """
    await get_ledger(db, uid, ledger_id)   # verify ownership
    await set_default_ledger(db, uid, ledger_id)
    return await get_ledgers(db, uid)


@router.delete("/{ledger_id}", status_code=204)
async def delete_ledger_endpoint(
    ledger_id: str,
    uid:       str          = Depends(get_current_uid),
    db:        AsyncSession = Depends(get_db),
):
    """
    Delete a ledger and all its expenses.
    Guards:
      - Cannot delete the default ledger
      - Cannot delete the last remaining ledger
    """
    await delete_ledger(db, uid, ledger_id)
