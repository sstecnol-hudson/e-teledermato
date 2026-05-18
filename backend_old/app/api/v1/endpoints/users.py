from typing import Any
from fastapi import APIRouter, Depends
from app.api import deps
from app.models.models import User
from app.schemas.user import User as UserSchema

router = APIRouter()


@router.get("/me", response_model=UserSchema)
def read_current_user(
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    return current_user
