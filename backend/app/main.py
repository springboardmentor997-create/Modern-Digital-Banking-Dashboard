from fastapi import FastAPI
from app.db.database import Base, engine
from app.models import user, account, transaction, budget, bill
from app.routers import auth, accounts, transactions, budgets, bills

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Banking Dashboard API")

app.include_router(auth.router)
app.include_router(accounts.router)
app.include_router(transactions.router)
app.include_router(budgets.router)
app.include_router(bills.router)

@app.get("/")
def root():
    return {"Message": "Banking Dashboard API Running"}
