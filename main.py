# app/main.py

import os
from datetime import timedelta
from dotenv import load_dotenv

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import (
    OAuth2PasswordRequestForm,
    HTTPBearer,
    HTTPAuthorizationCredentials
)

from sqlalchemy.orm import Session

from app import models, schemas, crud, auth
from app.database import SessionLocal, engine, Base

# Load environment variables
load_dotenv()

# Create FastAPI app
app = FastAPI(title="Auth Example")

# Create tables (development only)
Base.metadata.create_all(bind=engine)

# Security
security = HTTPBearer()   # THIS FIXES THE EMPTY POPUP ISSUE


# Dependency: DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Public root
@app.get("/")
def home():
    return {"message": "FastAPI is working!"}


# -------------------------
# REGISTER USER
# -------------------------
@app.post("/auth/register", response_model=schemas.UserOut, status_code=201)
def register(user_in: schemas.UserCreate, db: Session = Depends(get_db)):
    if crud.get_user_by_email(db, user_in.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    return crud.create_user(db, user_in)


# -------------------------
# LOGIN → GET TOKEN
# -------------------------
@app.post("/auth/token", response_model=schemas.Token)
def login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = crud.get_user_by_email(db, form.username)

    if not user or not auth.verify_password(form.password, user.password):
        raise HTTPException(status_code=400, detail="Incorrect username or password")

    expires = timedelta(minutes=int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 60)))
    token = auth.create_access_token({"sub": user.email}, expires_delta=expires)

    return {"access_token": token, "token_type": "bearer"}



@app.get("/users/me", response_model=schemas.UserOut)
def read_users_me(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
):
    """
    HTTPBearer ensures Swagger shows a Bearer Token popup.
    credentials.scheme => "Bearer"
    credentials.credentials => <JWT token>
    """
    token = credentials.credentials

    payload = auth.decode_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    email = payload.get("sub")
    user = crud.get_user_by_email(db, email)

    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    return user
