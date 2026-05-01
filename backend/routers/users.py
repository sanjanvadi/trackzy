from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from middleware.auth import get_current_uid
from models.db_models import UserCreate, UserUpdate, UserRead
from services.db_service import get_user, create_or_update_user, delete_user

router = APIRouter(prefix="/users", tags=["users"])


@router.post("", response_model=UserRead, status_code=201)
async def register_user(
    payload: UserCreate,
    uid:     str          = Depends(get_current_uid),
    db:      AsyncSession = Depends(get_db),
):
    """
    Called once after Firebase sign-up / on every login (idempotent).
    Creates user + 2 default ledgers (Personal, Business) on first call.
    UID always comes from the verified Firebase token — never the request body.
    """
    try:
        user = await create_or_update_user(db, uid, payload.model_dump())
        return user
    except:
        raise HTTPException(status_code=404, detail="User Already exists.")


@router.get("/me", response_model=UserRead)
async def get_profile(
    uid: str          = Depends(get_current_uid),
    db:  AsyncSession = Depends(get_db),
):
    user = await get_user(db, uid)
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    return user


@router.patch("/me", response_model=UserRead)
async def update_profile(
    payload: UserUpdate,
    uid:     str          = Depends(get_current_uid),
    db:      AsyncSession = Depends(get_db),
):
    user = await get_user(db, uid)
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    updates = {k: v for k, v in payload.model_dump().items() if v is not None}
    if updates:
        from services.db_service import create_or_update_user
        user = await create_or_update_user(db, uid, updates)
    return user


@router.delete("/me", status_code=204)
async def delete_account(
    uid: str          = Depends(get_current_uid),
    db:  AsyncSession = Depends(get_db),
):
    """
    Permanently delete user account + all ledgers + all expenses.
    GDPR compliance — user has the right to erasure.
    """
    await delete_user(db, uid)
