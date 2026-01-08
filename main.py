# app/main.py

import os
from dotenv import load_dotenv
from fastapi import FastAPI, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi.openapi.utils import get_openapi
from app.schemas import BillOut
from typing import List
from app.schemas import KYCUserOut
# ================= LOAD ENV (🔥 MUST BE FIRST) =================
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ENV_PATH = os.path.join(BASE_DIR, ".env")
load_dotenv(ENV_PATH)

ADMIN_SECRET_KEY = os.getenv("ADMIN_SECRET_KEY")


# ================= IMPORTS AFTER ENV =================
from app import models, schemas, crud, auth
from app.database import SessionLocal, engine, Base
from app.models import User, Transaction, Account, Reward
from app.auth import admin_required

# ================= CONFIG =================
INITIAL_BALANCE = 1000

app = FastAPI(title="🏦 Shreyas Bank")

# ================= CORS =================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

# ================= DB =================
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ================= ROOT =================
@app.get("/")
def home():
    return {"message": "Bank API running"}

# ================= AUTH =================
@app.post("/auth/register", response_model=schemas.UserOut, status_code=201)
def register(user_in: schemas.UserCreate, db: Session = Depends(get_db)):

    if crud.get_user_by_email(db, user_in.email):
        raise HTTPException(status_code=400, detail="Email already registered")

    user = models.User(
        name=user_in.name,
        email=user_in.email,
        phone=user_in.phone,
        hashed_password=auth.get_password_hash(user_in.password),
        role=user_in.role   # ✅ DIRECTLY FROM FRONTEND
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    # Create account ONLY for normal users
    if user.role == models.RoleEnum.user:
        account = models.Account(
            user_id=user.id,
            account_type="Savings",
            balance=1000
        )
        db.add(account)
        db.flush()

        db.add(models.Transaction(
            sender_id=None,
            receiver_id=user.id,
            amount=1000,
            message="Initial deposit"
        ))

        db.add(models.Card(
            account_id=account.id,
            card_type="Debit",
            last4=str(user.id).zfill(4),
            expiry="12/28",
            network="VISA"
        ))

    db.commit()
    return user


@app.post("/auth/token", response_model=schemas.Token)
def login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = crud.get_user_by_email(db, form.username)

    if not user or not auth.verify_password(form.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Invalid credentials")

    if user.is_active == 0:
        raise HTTPException(status_code=403, detail="User deactivated")

    token = auth.create_access_token({
        "sub": user.email,
        "role": user.role.value   # ✅ IMPORTANT
    })

    return {
        "access_token": token,
        "token_type": "bearer",
        "user_id": user.id,
        "role": user.role.value
    }

@app.post("/auth/reset-password")
def reset_password(payload: dict, db: Session = Depends(get_db)):
    username = payload.get("username")
    new_password = payload.get("new_password")

    user = db.query(User).filter(User.email == username).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.hashed_password = auth.get_password_hash(new_password)
    db.commit()

    return {"message": "Password updated successfully"}

# ================= DASHBOARD =================
@app.get("/dashboard/{user_id}")
def dashboard(user_id: int, db: Session = Depends(get_db)):
    credit = db.query(func.coalesce(func.sum(models.Transaction.amount), 0))\
        .filter(models.Transaction.receiver_id == user_id).scalar()

    debit = db.query(func.coalesce(func.sum(models.Transaction.amount), 0))\
        .filter(models.Transaction.sender_id == user_id).scalar()

    balance = credit - debit

    return {
        "total_balance": balance,
        "savings": int(balance * 0.7),
        "credit_used": debit,
        "rewards": int(credit / 100),
        "spent": debit
    }

# ================= TRANSFER =================
@app.post("/transfer/{from_user_id}")
def transfer(from_user_id: int, payload: dict, db: Session = Depends(get_db)):
    to_user_id = payload.get("to_user_id")
    amount = payload.get("amount")
    message = payload.get("message", "")

    if amount <= 0:
        raise HTTPException(status_code=400, detail="Invalid amount")

    credit = db.query(func.coalesce(func.sum(models.Transaction.amount), 0))\
        .filter(models.Transaction.receiver_id == from_user_id).scalar()

    debit = db.query(func.coalesce(func.sum(models.Transaction.amount), 0))\
        .filter(models.Transaction.sender_id == from_user_id).scalar()

    available_balance = credit - debit

    if amount > available_balance:
        raise HTTPException(status_code=400, detail="Insufficient funds")

    db.add(
        models.Transaction(
            sender_id=from_user_id,
            receiver_id=to_user_id,
            amount=amount,
            message=message
        )
    )

    db.commit()
    return {"message": "Transfer successful"}

@app.post("/rewards/redeem/{user_id}")
def redeem_reward(
    user_id: int,
    amount: int,
    db: Session = Depends(get_db)
):
    # 1️⃣ Get active account
    account = db.query(Account).filter(
        Account.user_id == user_id,
        Account.status == "Active"
    ).first()

    if not account:
        raise HTTPException(404, "No active account found")

    # 2️⃣ Add money
    account.balance += amount

    # 3️⃣ Create transaction
    txn = Transaction(
        sender_id=None,
        receiver_id=user_id,
        amount=amount,
        message="Reward Redeemed"
    )

    db.add(txn)
    db.commit()

    return {
        "message": "Reward redeemed successfully",
        "new_balance": account.balance
    }

# ================= TRANSACTIONS =================
@app.get("/transactions/{user_id}")
def transactions(user_id: int, db: Session = Depends(get_db)):
    txns = db.query(models.Transaction)\
        .filter(
            (models.Transaction.sender_id == user_id) |
            (models.Transaction.receiver_id == user_id)
        ).order_by(models.Transaction.created_at.desc()).all()

    return [{
        "amount": t.amount,
        "type": "debit" if t.sender_id == user_id else "credit",
        "message": t.message,
        "created_at": t.created_at
    } for t in txns]

# ================= ACCOUNTS =================


@app.get("/accounts/{user_id}")
def accounts(user_id: int, db: Session = Depends(get_db)):
    accounts = (
        db.query(models.Account)
        .filter(models.Account.user_id == user_id)
        .all()
    )

    if not accounts:
        return []

    # ✅ CALCULATE REAL BALANCE FROM TRANSACTIONS
    credit = db.query(func.coalesce(func.sum(models.Transaction.amount), 0)) \
        .filter(models.Transaction.receiver_id == user_id) \
        .scalar()

    debit = db.query(func.coalesce(func.sum(models.Transaction.amount), 0)) \
        .filter(models.Transaction.sender_id == user_id) \
        .scalar()

    real_balance = credit - debit

    # ✅ RETURN DYNAMIC BALANCE
    return [
        {
            "id": acc.id,
            "account_type": acc.account_type,
            "balance": real_balance,
            "status": acc.status,
        }
        for acc in accounts
    ]

# ================= CARDS =================
@app.get("/cards/{user_id}")
def cards(user_id: int, db: Session = Depends(get_db)):
    return db.query(models.Card)\
        .join(models.Account)\
        .filter(models.Account.user_id == user_id).all()

# ================= REWARDS =================
@app.get("/rewards/{user_id}")
def rewards(user_id: int, db: Session = Depends(get_db)):
    credit = db.query(func.coalesce(func.sum(models.Transaction.amount), 0))\
        .filter(models.Transaction.receiver_id == user_id).scalar()

    points = int(credit / 100)
    offers = []
    if points >= 100: offers.append("₹100 Cashback")
    if points >= 500: offers.append("Movie Ticket")
    if points >= 1000: offers.append("Travel Voucher")

    return {"points": points, "offers": offers or ["No offers yet"]}
@app.post("/rewards/redeem/{reward_id}")
def redeem_reward(
    reward_id: int,
    db: Session = Depends(get_db)
):
    reward = db.query(Reward).filter(Reward.id == reward_id).first()

    if not reward:
        raise HTTPException(status_code=404, detail="Reward not found")

    if reward.is_redeemed:
        raise HTTPException(status_code=400, detail="Reward already redeemed")

    # Coupon → just mark redeemed
    if reward.type == "coupon":
        reward.is_redeemed = True
        db.commit()
        return {"message": "Coupon redeemed", "coupon": reward.coupon_code}

    # Cash reward
    account = (
        db.query(Account)
        .filter(Account.user_id == reward.user_id, Account.status == "Active")
        .first()
    )

    if not account:
        raise HTTPException(status_code=400, detail="No active account")

    # Add balance
    account.balance += reward.amount

    # Transaction entry
    txn = Transaction(
        sender_id=None,
        receiver_id=reward.user_id,
        amount=reward.amount,
        message="Reward Redeemed"
    )

    reward.is_redeemed = True

    db.add(txn)
    db.commit()

    return {
        "message": "Cash reward redeemed",
        "amount": reward.amount,
        "new_balance": account.balance
    }

# ================= SETTINGS =================
@app.get("/settings/{user_id}")
def get_settings(user_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "name": user.name,
        "email": user.email,
        "phone": user.phone,
        "kyc_status": user.kyc_status.value,   # ✅ ADDED
        "created_at": user.created_at
    }

@app.put("/settings/profile/{user_id}")
def update_profile(user_id: int, payload: schemas.UpdateProfile, db: Session = Depends(get_db)):
    user = db.query(models.User).get(user_id)
    user.name = payload.name
    user.phone = payload.phone
    db.commit()
    return {"message": "Profile updated"}

@app.put("/settings/change-password/{user_id}")
def change_password(user_id: int, payload: schemas.ChangePassword, db: Session = Depends(get_db)):
    user = db.query(models.User).get(user_id)
    if not auth.verify_password(payload.old_password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Wrong password")

    user.hashed_password = auth.get_password_hash(payload.new_password)
    db.commit()
    return {"message": "Password changed"}

# ================= BUDGET =================
@app.post("/budget/{user_id}")
def set_budget(user_id: int, payload: schemas.BudgetCreate, db: Session = Depends(get_db)):
    budget = db.query(models.Budget).filter_by(user_id=user_id).first()
    if budget:
        budget.amount = payload.amount
    else:
        db.add(models.Budget(user_id=user_id, amount=payload.amount))
    db.commit()
    return {"message": "Budget saved"}

@app.get("/budget/{user_id}")
def get_budget(user_id: int, db: Session = Depends(get_db)):
    budget = db.query(models.Budget).filter_by(user_id=user_id).first()
    return {"amount": budget.amount if budget else 0}

@app.post("/bills/{user_id}", response_model=BillOut)
def create_bill(user_id: int, payload: schemas.BillCreate, db: Session = Depends(get_db)):
    bill = models.Bill(
        user_id=user_id,
        title=payload.title,
        amount=payload.amount,
        due_date=payload.due_date
    )
    db.add(bill)
    db.commit()
    db.refresh(bill)
    return bill
@app.get("/bills/{user_id}", response_model=list[schemas.BillOut])
def get_bills(user_id: int, db: Session = Depends(get_db)):
    return db.query(models.Bill)\
        .filter(models.Bill.user_id == user_id)\
        .order_by(models.Bill.due_date)\
        .all()
@app.put("/bills/pay/{bill_id}")
def pay_bill(bill_id: int, db: Session = Depends(get_db)):
    bill = db.query(models.Bill).filter(models.Bill.id == bill_id).first()
    if not bill:
        raise HTTPException(status_code=404, detail="Bill not found")

    bill.is_paid = True
    db.commit()
    return {"message": "Bill marked as paid"}
@app.put("/settings/kyc/{user_id}")
def verify_kyc(user_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.kyc_status == models.KYCStatusEnum.verified:
        return {"message": "KYC already verified"}

    user.kyc_status = models.KYCStatusEnum.verified
    db.commit()

    return {"message": "KYC verified successfully"}
@app.post("/accounts/{user_id}")
def create_account(
    user_id: int,
    db: Session = Depends(get_db)
):
    account = models.Account(
        user_id=user_id,
        account_type="Savings",
        balance=1000,          # initial balance
        status="Active"
    )
    db.add(account)
    db.commit()
    db.refresh(account)

    return account
@app.post("/accounts/link/{user_id}")
def link_existing_account(
    user_id: int,
    db: Session = Depends(get_db)
):
    account = models.Account(
        user_id=user_id,
        account_type="Linked Account",
        balance=0,
        status="Active"
    )
    db.add(account)
    db.commit()
    db.refresh(account)

    return account
@app.put("/accounts/close/{account_id}")
def close_account(
    account_id: int,
    db: Session = Depends(get_db)
):
    account = db.query(models.Account).filter(
        models.Account.id == account_id
    ).first()

    if not account:
        raise HTTPException(status_code=404, detail="Account not found")

    if account.status == "Closed":
        raise HTTPException(status_code=400, detail="Account already closed")

    account.status = "Closed"
    db.commit()

    return {"message": "Account closed successfully"}


@app.get("/rewards/insights/{user_id}")
def reward_insights(user_id: int, db: Session = Depends(get_db)):
    rewards = db.query(Reward).filter(Reward.user_id == user_id).all()

    total_earned = sum(r.amount or 0 for r in rewards)
    total_redeemed = sum((r.amount or 0) for r in rewards if r.is_redeemed)
    available = total_earned - total_redeemed

    cash_count = sum(1 for r in rewards if r.type == "cash")
    coupon_count = sum(1 for r in rewards if r.type == "coupon")

    return {
        "total_earned": total_earned,
        "total_redeemed": total_redeemed,
        "available": available,
        "cash_rewards": cash_count,
        "coupon_rewards": coupon_count
    }
    

@app.get("/alerts/{user_id}")
def alerts(user_id: int, db: Session = Depends(get_db)):
    alerts = []

    # ✅ CALCULATE REAL BALANCE FROM TRANSACTIONS
    credit = db.query(func.coalesce(func.sum(models.Transaction.amount), 0))\
        .filter(models.Transaction.receiver_id == user_id).scalar()

    debit = db.query(func.coalesce(func.sum(models.Transaction.amount), 0))\
        .filter(models.Transaction.sender_id == user_id).scalar()

    balance = credit - debit

    # 🔴 LOW BALANCE ALERT
    if balance < 100:
        alerts.append({
            "type": "low_balance",
            "message": f"⚠️ Low balance! Only ₹{balance} left"
        })

    # 🎁 UNREDEEMED REWARDS ALERT
    unredeemed = db.query(Reward).filter(
        Reward.user_id == user_id,
        Reward.is_redeemed == False
    ).count()

    if unredeemed > 0:
        alerts.append({
            "type": "reward",
            "message": f"🎁 You have {unredeemed} unredeemed rewards"
        })

    # 🟢 FALLBACK INFO
    if not alerts:
        alerts.append({
            "type": "info",
            "message": "✅ Everything looks good. No urgent alerts."
        })

    return alerts
@app.put("/settings/kyc/{user_id}")
def verify_kyc(user_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.kyc_status == models.KYCStatusEnum.verified:
        return {"message": "KYC already verified"}

    user.kyc_status = models.KYCStatusEnum.verified
    db.commit()

    return {"message": "KYC verified successfully"}

@app.get("/admin/users", dependencies=[Depends(admin_required)])
def admin_users(db: Session = Depends(get_db)):
    users = (
        db.query(User)
        .filter(User.role != models.RoleEnum.admin)  # ✅ EXCLUDE ADMINS
        .order_by(User.created_at.desc())
        .all()
    )
    return users


@app.put("/admin/user/{user_id}/status", dependencies=[Depends(admin_required)])
def toggle_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    user.is_active = 0 if user.is_active else 1
    db.commit()
    return {"active": bool(user.is_active)}


@app.get("/admin/transactions", dependencies=[Depends(admin_required)])
def admin_transactions(db: Session = Depends(get_db)):
    return db.query(Transaction).order_by(Transaction.created_at.desc()).all()


@app.get("/admin/summary", dependencies=[Depends(admin_required)])
def admin_summary(db: Session = Depends(get_db)):
    total_users = (
        db.query(func.count(User.id))
        .filter(User.role != models.RoleEnum.admin)   # ✅ exclude admins
        .scalar()
    )

    active_users = (
        db.query(func.count(User.id))
        .filter(
            User.role != models.RoleEnum.admin,       # ✅ exclude admins
            User.is_active == 1
        )
        .scalar()
    )

    admin_users = (
        db.query(func.count(User.id))
        .filter(User.role == models.RoleEnum.admin)
        .scalar()
    )

    total_transactions = db.query(func.count(Transaction.id)).scalar()

    return {
        "total_users": total_users,        # 👥 customers only
        "active_users": active_users,      # 🟢 active customers only
        "admin_users": admin_users,        # 🛡️ admins separately
        "total_transactions": total_transactions
    }

@app.get("/admin/account-details/{user_id}", dependencies=[Depends(admin_required)])
def admin_account_details(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    accounts = db.query(Account).filter(Account.user_id == user_id).all()

    if not accounts:
        raise HTTPException(
            status_code=404,
            detail="No accounts found for this user"
        )

    total_balance = sum(acc.balance for acc in accounts)

    return {
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email
        },
        "total_balance": total_balance,
        "accounts": [
            {
                "id": acc.id,
                "type": acc.account_type,   # ✅ CORRECT FIELD
                "balance": acc.balance,
                "status": acc.status
            }
            for acc in accounts
        ]
    }
@app.get("/admin/kyc", response_model=list[schemas.KYCUserOut])
def get_kyc_overview(
    db: Session = Depends(get_db),
    _: dict = Depends(admin_required)
):
    users = (
        db.query(models.User)
        .filter(models.User.role != models.RoleEnum.admin)  # ✅ EXCLUDE ADMINS
        .order_by(models.User.created_at.desc())
        .all()
    )
    return users

# ================== OPENAPI ==================
def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema

    schema = get_openapi(
        title=app.title,
        version="1.0.0",
        routes=app.routes,
    )
    app.openapi_schema = schema
    return schema

app.openapi = custom_openapi
