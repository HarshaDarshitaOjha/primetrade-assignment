from datetime import datetime, timedelta
from typing import Any, Optional

from jose import jwt
from passlib.context import CryptContext

from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def _bcrypt_safe_bytes(password: str) -> bytes:
    """Return a byte string truncated to bcrypt's 72‑byte limit.

    Bcrypt silently truncates input to 72 bytes; passing longer values
    raises a ValueError in some combinations of passlib/bcrypt.  We
    truncate explicitly so callers don't have to worry about it and
    so that hashing/verifying is consistent.
    """
    pw_bytes = password.encode("utf-8")
    if len(pw_bytes) > 72:
        # slice keeps valid utf-8 boundaries? we don't need to preserve
        # original semantics since callers already checked length earlier.
        pw_bytes = pw_bytes[:72]
    return pw_bytes


def hash_password(password: str) -> str:
    """Hash a plain-text password, safely handling bcrypt length limits."""
    safe_bytes = _bcrypt_safe_bytes(password)
    # passlib allows bytes input directly
    return pwd_context.hash(safe_bytes)


def verify_password(plain_password: str, password_hash: str) -> bool:
    # apply same truncation logic as the hasher so that login works
    safe_bytes = _bcrypt_safe_bytes(plain_password)
    return pwd_context.verify(safe_bytes, password_hash)


def create_access_token(subject: str, role: str, expires_minutes: Optional[int] = None) -> str:
    expire = datetime.utcnow() + timedelta(
        minutes=expires_minutes if expires_minutes is not None else settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )
    to_encode: dict[str, Any] = {"sub": subject, "role": role, "exp": expire}
    return jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)