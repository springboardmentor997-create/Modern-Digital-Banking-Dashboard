from fastapi import FastAPI, Depends
from app.auth.router import router as auth_router
from app.accounts.router import router as accounts_router
from app.dependencies import get_current_user_email
from app.transactions.router import router as transactions_router

app = FastAPI(title="Modern Digital Banking API")

app.include_router(auth_router)
app.include_router(accounts_router)
app.include_router(transactions_router)


@app.get("/protected")
def protected_route(current_user: str = Depends(get_current_user_email)):
    return {
        "message": "You are authenticated",
        "user": current_user
    }

