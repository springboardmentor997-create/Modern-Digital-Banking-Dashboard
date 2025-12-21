from fastapi import FastAPI
from app.auth.router import router as auth_router

app = FastAPI(title="Modern Digital Banking API")

app.include_router(auth_router)
