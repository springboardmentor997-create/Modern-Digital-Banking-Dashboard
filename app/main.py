"""
Application Entry Point

What:
- Creates FastAPI app
- Registers all routers

Backend Connections:
- Imports routers from:
  - app.routers.auth
  - app.routers.accounts
  - app.routers.transactions
  more...

Frontend Connections:
- All frontend API calls (services/api.js)
  ultimately reach this file first

Flow:
Frontend → api.js → FastAPI (main.py) → Router → Service → DB
"""




from fastapi import FastAPI
from app.database import Base, engine
from app.models import user, account
from app.auth.router import router as auth_router
from fastapi.middleware.cors import CORSMiddleware
from app.accounts.router import router as accounts_router
from app.transactions.router import router as transactions_router
from app.transfers.router import router as transfers_router
from app.budgets.router import router as budgets_router
from app.bills.router import router as bills_router
from app.exports.router import router as exports_router
from app.alerts.router import router as alerts_router
from app.rewards.router import router as rewards_router
from app.insights.router import router as insights_router
from app.routers.devices import router as devices_router
from app.settings.router import router as settings_router

from app.routers.user import router as user_router
from app.routers.admin import router as admin_router
from app.routers.admin_transactions import router as admin_transactions_router
from app.routers.admin_rewards import router as admin_rewards_router
from app.routers.admin_alerts import router as admin_alerts_router
from app.routers.admin_dashboard import router as admin_dashboard_router
from app.routers.admin_analytics import router as admin_analytics_router
from app.routers.admin_profile import router as admin_profile_router

from app.firebase.firebase import init_firebase



app = FastAPI(title="Modern Digital Banking Dashboard API")


@app.on_event("startup")
def startup_event():
    init_firebase()


# include auth router (this registers /auth/* endpoints)
app.include_router(auth_router)
app.include_router(accounts_router)
app.include_router(transfers_router)
app.include_router(transactions_router)
app.include_router(budgets_router)
app.include_router(bills_router)
app.include_router(exports_router)
app.include_router(alerts_router)
app.include_router(rewards_router)
app.include_router(insights_router)
app.include_router(devices_router)
app.include_router(settings_router)

app.include_router(user_router)
app.include_router(admin_router)
app.include_router(admin_transactions_router)
app.include_router(admin_rewards_router)
app.include_router(admin_alerts_router)
app.include_router(admin_dashboard_router)
app.include_router(admin_analytics_router)
app.include_router(admin_profile_router)

@app.get("/")
def root():
    return {"message": "Banking API Running"}

origins = ["http://localhost:5173",
          "http://localhost:3000",
          "https://modern-digital-banking-dashboard-8q5y9g9iz.vercel.app",
          "https://modern-digital-banking-dashboard-tawny.vercel.app",
          ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
