from fastapi import APIRouter, HTTPException, Depends
from app.models import UserCreate, UserResponse
from app.auth import hash_password, get_current_user
from app.database import get_db
from typing import List

router = APIRouter()

def require_admin(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

@router.post("", response_model=UserResponse, dependencies=[Depends(require_admin)])
def create_user(user: UserCreate):
    db = get_db()
    
    # Check if user exists
    existing = db.table("users").select("id").eq("email", user.email).execute()
    if existing.data:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Hash password
    hashed_password = hash_password(user.password)
    
    # Insert user
    response = db.table("users").insert({
        "email": user.email,
        "password_hash": hashed_password,
        "full_name": user.full_name,
        "role": user.role,
        "phone": user.phone
    }).execute()
    
    if response.data:
        user_data = response.data[0]
        return UserResponse(
            id=user_data["id"],
            email=user_data["email"],
            full_name=user_data["full_name"],
            role=user_data["role"],
            phone=user_data.get("phone")
        )
    
    raise HTTPException(status_code=500, detail="Failed to create user")

@router.get("", response_model=List[UserResponse], dependencies=[Depends(require_admin)])
def list_users():
    db = get_db()
    response = db.table("users").select("id, email, full_name, role, phone").execute()
    return [UserResponse(**user) for user in response.data]

@router.get("/{user_id}", response_model=UserResponse)
def get_user(user_id: str, current_user: dict = Depends(get_current_user)):
    db = get_db()
    response = db.table("users").select("id, email, full_name, role, phone").eq("id", user_id).execute()
    
    if not response.data:
        raise HTTPException(status_code=404, detail="User not found")
    
    return UserResponse(**response.data[0])