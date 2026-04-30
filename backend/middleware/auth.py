from fastapi import HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from firebase_admin import auth as firebase_auth
from core.logging import get_logger

logger        = get_logger(__name__)
bearer_scheme = HTTPBearer()

async def get_current_uid(
    credentials: HTTPAuthorizationCredentials = Security(bearer_scheme),
) -> str:
    """
    Verifies Firebase ID token from Authorization: Bearer <token>.
    Returns the uid. All protected routes use:  uid: str = Depends(get_current_uid)
    """
    token = credentials.credentials
    try:
        decoded = firebase_auth.verify_id_token(token, check_revoked=True)
        return decoded["uid"]
    except firebase_auth.RevokedIdTokenError:
        raise HTTPException(status_code=401, detail="Token revoked. Please sign in again.")
    except firebase_auth.ExpiredIdTokenError:
        raise HTTPException(status_code=401, detail="Token expired. Please sign in again.")
    except firebase_auth.InvalidIdTokenError:
        raise HTTPException(status_code=401, detail="Invalid token.")
    except Exception as e:
        logger.error(f"Auth error: {e}")
        raise HTTPException(status_code=401, detail="Authentication failed.")
