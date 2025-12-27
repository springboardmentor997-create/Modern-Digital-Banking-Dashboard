🏦 Modern Digital Banking Dashboard

A full-stack Digital Banking Dashboard designed with a real-world backend architecture and a modern frontend.
Built milestone-by-milestone with clear separation of concerns, testing, and scalability in mind.

📌 Project Overview

This project simulates a personal digital banking system, allowing users to:

Manage bank accounts

Track income & expenses

Plan budgets

Receive alerts

View aggregated financial insights via a dashboard

The backend is implemented using FastAPI + PostgreSQL, and the frontend uses React + Tailwind CSS.

🧱 Tech Stack
Backend

FastAPI

PostgreSQL

SQLAlchemy

JWT Authentication

Pydantic

Passlib (bcrypt)

Frontend

React

Tailwind CSS

Axios

Context API

📁 Repository Structure
Modern-Digital-Banking-Dashboard/
├── backend/      # FastAPI backend (core logic)
├── frontend/     # React frontend (UI)
└── README.md     # This file

🚩 Milestones Completed
✅ Milestone 1

Authentication & authorization

User registration & login

JWT security

Account management

✅ Milestone 2

Transactions (income / expense)

Budgets & budget validation

Alerts system

Dashboard aggregation APIs

🔐 Authentication Flow

User logs in

Backend issues JWT token

Token used for all protected APIs

Role & ownership enforced at service level

🧪 Testing Philosophy

No mock databases

Real PostgreSQL queries

Explicit service-level test files

Each feature tested immediately after implementation

🚀 How to Run (Local)
Backend
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload

Frontend
cd frontend
npm install
npm run dev

📈 Future Enhancements

Advanced analytics & insights

Admin dashboard

Auditor & support roles

Charts & trend analysis

Deployment (Docker / Cloud)

👤 Author

Anshika Aggarwal
Backend & Full-Stack Development
FastAPI | PostgreSQL | React
