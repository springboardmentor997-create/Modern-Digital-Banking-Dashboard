from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base
from app.auth.router import router as auth_router
from app.accounts.router import router as accounts_router
from app.transactions.router import router as transactions_router

# Create tables - wrapped in try/except to handle database connection issues
try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"Warning: Could not create database tables: {e}")
    print("Make sure PostgreSQL is running with correct credentials")

app = FastAPI(
    title="Modern Digital Banking Dashboard",
    description="Unified personal banking hub",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router, prefix="/api/auth", tags=["auth"])
app.include_router(accounts_router, prefix="/api/accounts", tags=["accounts"])
app.include_router(transactions_router, prefix="/api/transactions", tags=["transactions"])

@app.get("/")
def read_root():
    return {"message": "Modern Digital Banking Dashboard API", "version": "1.0.0"}

@app.get("/health")
def health_check():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
