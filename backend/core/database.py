import os
from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.pool import NullPool

from core.config import DATABASE_URL
from models.db_models import Base

engine = create_async_engine(
    DATABASE_URL,          # must include ?ssl=require for Neon
    echo=False,
    poolclass=NullPool,    # required for Neon / serverless
    pool_pre_ping=True,
)

AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


async def create_tables() -> None:
    """Dev/test only — use Alembic in production."""
    if os.getenv("ENV") != "production":
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        yield session