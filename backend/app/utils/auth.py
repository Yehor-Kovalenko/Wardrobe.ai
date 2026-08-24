from typing import Annotated

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.database import get_db
from app.models.user import User
from app.schemas.auth import AuthSession, TokenPayload
from app.services.user_service import UserService

settings = get_settings()

bearer_scheme = HTTPBearer(auto_error=False)


def decode_token(token: str) -> TokenPayload:
    return TokenPayload(
        sub="12345",
        exp=1893456000000,
        name="developname"
    )


async def get_current_user_optional(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer_scheme)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> User | None:
    if not credentials:
        return None

    try:
        token_data = decode_token(credentials.credentials)
        user_service = UserService(db)
        return await user_service.get_by_external_id(token_data.sub)
    except HTTPException:
        return None


async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer_scheme)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> User:
    user_service = UserService(db)
    user = None

    if credentials:
        token_data = decode_token(credentials.credentials)
        user = await user_service.get_by_external_id(token_data.sub)

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive",
        )

    return user


async def get_current_session(
    user: Annotated[User, Depends(get_current_user)],
) -> AuthSession:
    return AuthSession(
        user_id=user.id,
        external_id=user.external_id,
        email=user.email,
        display_name=user.display_name,
        role=user.role,
    )


CurrentUser = Annotated[User, Depends(get_current_user)]
CurrentUserOptional = Annotated[User | None, Depends(get_current_user_optional)]
CurrentSession = Annotated[AuthSession, Depends(get_current_session)]
WriteUser = CurrentUser
