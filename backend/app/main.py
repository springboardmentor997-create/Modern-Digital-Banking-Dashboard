from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.auth import router as auth_router
from app.routers import transactions, accounts, budgets, bills, rewards, alerts

app = FastAPI()

# CORS
origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

app.include_router(auth_router.router)
app.include_router(transactions.router)
app.include_router(accounts.router)
app.include_router(budgets.router)
app.include_router(bills.router)
app.include_router(rewards.router)
app.include_router(alerts.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the API"}
