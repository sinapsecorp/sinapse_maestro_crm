from fastapi import APIRouter, Depends
from src.schemas.user_schemas import UserInDB
from src.utils.security import get_current_user
from src.models.user import User

router = APIRouter()

@router.get("/me", response_model=UserInDB)
def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user
