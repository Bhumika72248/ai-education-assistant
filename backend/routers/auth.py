import os
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlmodel import Session, select
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel
from db import get_session
from models.schemas import User
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY", "changeme")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 1440))

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

router = APIRouter()


class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    role: str = "student"


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    to_encode["exp"] = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def get_current_user(token: str = Depends(oauth2_scheme), session: Session = Depends(get_session)) -> User:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if not email:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = session.exec(select(User).where(User.email == email)).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


@router.post("/register")
def register(body: RegisterRequest, session: Session = Depends(get_session)):
    print(f"[REGISTER] name={body.name} email={body.email} role={body.role}")
    if body.role not in ("student", "teacher"):
        raise HTTPException(status_code=400, detail="Role must be 'student' or 'teacher'")
    if session.exec(select(User).where(User.email == body.email)).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(name=body.name, email=body.email, hashed_password=hash_password(body.password), role=body.role)
    session.add(user)
    session.commit()
    session.refresh(user)
    print(f"[REGISTER] Success: user_id={user.id}")
    return {"message": "Registered successfully", "user_id": user.id}


@router.post("/login")
def login(form: OAuth2PasswordRequestForm = Depends(), session: Session = Depends(get_session)):
    print(f"[LOGIN] Attempt for email={form.username}")
    user = session.exec(select(User).where(User.email == form.username)).first()
    if not user or not verify_password(form.password, user.hashed_password):
        print(f"[LOGIN] Failed for email={form.username}")
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token({"sub": user.email, "role": user.role})
    print(f"[LOGIN] Success: user_id={user.id} role={user.role}")
    return {"access_token": token, "token_type": "bearer", "user_id": user.id, "role": user.role, "name": user.name}


@router.get("/me")
def me(current_user: User = Depends(get_current_user)):
    return {"id": current_user.id, "name": current_user.name, "email": current_user.email, "role": current_user.role}
