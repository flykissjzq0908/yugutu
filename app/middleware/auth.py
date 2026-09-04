"""JWT bearer authentication, modeled after AIReport's middleware/auth.py."""
from typing import Optional

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel

from app.config import get_settings

security = HTTPBearer(auto_error=False)


class CurrentUser(BaseModel):
    """Authenticated user claims from the JWT payload."""

    user_id: str = ""
    user_name: str = ""
    user_code: str = ""
    user_role: str = ""
    employee_id: str = ""
    permission_type: str = ""


def decode_jwt_payload(token: str, jwt_config) -> dict:
    """按配置顺序尝试多个 JWT 提供方，返回第一个校验通过的 payload。"""
    providers = [jwt_config] + list(getattr(jwt_config, "providers", None) or [])
    last_error: Optional[Exception] = None
    for provider in providers:
        if isinstance(provider, dict):
            secret_key = provider.get("secret_key") or jwt_config.secret_key
            issuer = provider.get("issuer")
            audience = provider.get("audience")
            algorithms = provider.get("algorithms") or ["HS256"]
        else:
            secret_key = getattr(provider, "secret_key", None) or jwt_config.secret_key
            issuer = getattr(provider, "issuer", None)
            audience = getattr(provider, "audience", None)
            algorithms = ["HS256"]
        try:
            return jwt.decode(
                token,
                secret_key,
                algorithms=algorithms,
                audience=audience,
                issuer=issuer,
            )
        except jwt.InvalidTokenError as exc:
            last_error = exc
    if last_error is not None:
        raise last_error
    raise jwt.InvalidTokenError("No JWT provider configured")


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
) -> CurrentUser:
    """Decode and verify the Bearer JWT token."""
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header missing",
            headers={"WWW-Authenticate": "Bearer"},
        )

    settings = get_settings().jwt
    token = credentials.credentials
    try:
        payload = decode_jwt_payload(token, settings)
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.InvalidTokenError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {exc}",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return CurrentUser(
        user_id=payload.get("sub") or payload.get("YHID", ""),
        user_name=payload.get("name") or payload.get("YHXM", ""),
        user_code=payload.get("YHGH", ""),
        user_role=payload.get("YHJS", ""),
        employee_id=payload.get("ZGID", ""),
        permission_type=payload.get("QXLB", ""),
    )
