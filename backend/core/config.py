import os
import json
from dotenv import load_dotenv

load_dotenv()

def _require(key: str) -> str:
    value = os.getenv(key)
    if not value:
        raise RuntimeError(
            f"Missing required environment variable: {key}\n"
            f"Copy .env.example to .env and fill in your values."
        )
    return value

# ── Required ───────────────────────────────────────────────────────────────────
GROQ_API_KEY       = _require("GROQ_API_KEY")
DATABASE_URL       = _require("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL is not set")

GOOGLE_CREDENTIALS = _require("GOOGLE_APPLICATION_CREDENTIALS")
FIREBASE_SERVICE_ACCOUNT = json.loads(_require("FIREBASE_SERVICE_ACCOUNT"))
# ── Optional ───────────────────────────────────────────────────────────────────
ENV             = os.getenv("ENV", "development")
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:8081").split(",")
IS_PRODUCTION   = ENV == "production"
