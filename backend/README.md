# 🏦 Modern Digital Banking Dashboard – Backend

This repository contains the **backend services** for the Modern Digital Banking Dashboard.

The backend handles:
- Authentication & authorization
- User & admin management
- Account handling
- Transactions
- KYC workflow
- Secure API access

---

## 🛠 Tech Stack

- FastAPI
- PostgreSQL
- SQLAlchemy
- Alembic
- JWT (Access & Refresh tokens)
- Pydantic
- Uvicorn

---

## 📁 Folder Structure
backend/
│
├── app/
│ ├── main.py # FastAPI entry point
│ ├── database.py # DB session & engine
│ ├── config.py # Environment config
│ ├── dependencies.py # Auth dependencies
│ │
│ ├── models/ # SQLAlchemy models
│ ├── schemas/ # Pydantic schemas
│ ├── routers/ # API routes
│ ├── services/ # Business logic
│ ├── utils/ # JWT, hashing, helpers
│
├── alembic/ # DB migrations
├── requirements.txt
└── README.md


---

## 🔐 Authentication

- User registration & login
- JWT access tokens
- Protected routes
- Role-based admin access

---

## 👤 User & Admin Modules

- User profile
- Admin profile & password management
- Role-based access control

---

## 🏦 Accounts Module

- Add bank accounts
- Link accounts to users
- PIN created during account creation

---

## 💳 Transactions Module

- UPI transfers
- Bank transfers
- Self account transfers
- Transaction history per account

---

## 🔒 Security Design

- Password hashing
- JWT validation
- Dependency-based authorization
- PIN architecture ready for backend enforcement

---

## ▶️ Run Backend

```bash
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload

Backend:
http://127.0.0.1:8000


Swagger:
http://127.0.0.1:8000/docs


