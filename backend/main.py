from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from core.config import ALLOWED_ORIGINS, IS_PRODUCTION
from core.database import create_tables
from core.logging import get_logger

# Firebase Admin must be imported before any route that uses auth
import core.firebase  # noqa: F401

from routers import users, ledgers, expenses, voice

logger  = get_logger(__name__)
limiter = Limiter(key_func=get_remote_address, default_limits=["200/minute"])


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Run on startup — create all tables if they don't exist."""
    logger.info("Creating database tables...")
    await create_tables()
    logger.info("Database ready.")
    yield


app = FastAPI(
    title="Expense Tracker API",
    version="2.0.0",
    docs_url=None  if IS_PRODUCTION else "/docs",
    redoc_url=None if IS_PRODUCTION else "/redoc",
    lifespan=lifespan,
)

# ── Rate limiting ──────────────────────────────────────────────────────────────
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Global exception handler ──────────────────────────────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception on {request.url}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal error occurred. Please try again."},
    )

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(users.router)
app.include_router(ledgers.router)
app.include_router(expenses.router)
app.include_router(voice.router)

# ── Health check ──────────────────────────────────────────────────────────────
@app.get("/health", tags=["health"])
async def health():
    return {"status": "ok", "version": "2.0.0"}
