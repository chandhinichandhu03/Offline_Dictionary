from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr, field_validator
from app.database.db import get_db
from app.models.user import User
from app.services.auth_service import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user,
    validate_password_strength,
)

router = APIRouter(prefix="/api", tags=["Authentication"])


class RegisterRequest(BaseModel):
    full_name: str
    email: str
    username: str
    password: str
    confirm_password: str

    @field_validator("full_name")
    @classmethod
    def validate_name(cls, v):
        if len(v.strip()) < 2:
            raise ValueError("Full name must be at least 2 characters")
        return v.strip()

    @field_validator("username")
    @classmethod
    def validate_username(cls, v):
        if len(v.strip()) < 3:
            raise ValueError("Username must be at least 3 characters")
        if not v.strip().isalnum():
            raise ValueError("Username must be alphanumeric")
        return v.strip().lower()

    @field_validator("email")
    @classmethod
    def validate_email(cls, v):
        if "@" not in v or "." not in v:
            raise ValueError("Invalid email format")
        return v.strip().lower()


class LoginRequest(BaseModel):
    identifier: str  # email or username
    password: str


class ProfileUpdateRequest(BaseModel):
    full_name: str | None = None
    email: str | None = None


@router.post("/register")
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    # Validate password match
    if req.password != req.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")

    # Validate password strength
    if not validate_password_strength(req.password):
        raise HTTPException(
            status_code=400,
            detail="Password must be at least 8 characters with uppercase, lowercase, digit, and special character",
        )

    # Check unique email
    if db.query(User).filter(User.email == req.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    # Check unique username
    if db.query(User).filter(User.username == req.username).first():
        raise HTTPException(status_code=400, detail="Username already taken")

    user = User(
        full_name=req.full_name,
        email=req.email,
        username=req.username,
        hashed_password=hash_password(req.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(data={"sub": str(user.id)})

    return {
        "message": "Registration successful",
        "token": token,
        "user": {
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "username": user.username,
            "is_admin": user.is_admin,
        },
    }


@router.post("/login")
def login(req: LoginRequest, db: Session = Depends(get_db)):
    # Find user by email or username
    user = (
        db.query(User)
        .filter((User.email == req.identifier.lower()) | (User.username == req.identifier.lower()))
        .first()
    )

    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )

    token = create_access_token(data={"sub": str(user.id)})

    return {
        "message": "Login successful",
        "token": token,
        "user": {
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "username": user.username,
            "is_admin": user.is_admin,
        },
    }


@router.get("/profile")
def get_profile(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "full_name": current_user.full_name,
        "email": current_user.email,
        "username": current_user.username,
        "is_admin": current_user.is_admin,
        "created_at": current_user.created_at.isoformat() if current_user.created_at else None,
    }


@router.put("/profile")
def update_profile(
    req: ProfileUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if req.full_name:
        current_user.full_name = req.full_name.strip()
    if req.email:
        existing = db.query(User).filter(User.email == req.email.lower(), User.id != current_user.id).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already in use")
        current_user.email = req.email.lower()
    db.commit()
    db.refresh(current_user)
    return {
        "message": "Profile updated",
        "user": {
            "id": current_user.id,
            "full_name": current_user.full_name,
            "email": current_user.email,
            "username": current_user.username,
        },
    }
