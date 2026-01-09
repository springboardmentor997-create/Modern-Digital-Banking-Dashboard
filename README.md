# 🏦 Modern Digital Banking Dashboard

A **full-stack digital banking application** built to simulate real-world banking systems such as UPI payments, account management, KYC flow, admin controls, and transaction analytics.

This project follows **industry-style architecture** with a clear separation of **frontend** and **backend**, secure authentication, and scalable design.

---

## 📦 Project Structure
Modern-Digital-Banking-Dashboard/
│
├── frontend/ # React + Vite application
├── backend/ # FastAPI backend
└── README.md # Project overview


---

## ✨ Key Features

### 👤 User Features
- Secure authentication (JWT)
- Add and manage bank accounts
- Transaction PIN–based payments
- UPI, Bank, and Self transfers
- Transaction history & analytics
- Profile & security overview
- KYC status tracking

### 🛠 Admin Features
- Admin dashboard
- User management
- KYC approval workflow
- Transaction monitoring
- Admin profile & password management

---

## 🛠 Tech Stack

### Frontend
- React (Vite)
- Tailwind CSS
- React Router
- Axios
- Recharts
- Lucide Icons

### Backend
- FastAPI
- PostgreSQL
- SQLAlchemy
- Alembic
- JWT Authentication
- Pydantic

---

## 🚀 Getting Started

### Run Frontend
```bash
cd frontend
npm install
npm run dev

Frontend URL:
http://localhost:5173


Run Backend

cd backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload

Backend URL:
http://127.0.0.1:8000


Swagger Docs:
http://127.0.0.1:8000/docs
