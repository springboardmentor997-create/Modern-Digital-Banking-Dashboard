🏦 Digital Banking Dashboard – Backend

A production-style backend built with FastAPI and PostgreSQL, following clean architecture and milestone-based development.

🛠 Tech Stack

FastAPI

PostgreSQL

SQLAlchemy ORM

JWT Authentication (OAuth2)

Passlib + bcrypt

Pydantic

python-dotenv

📁 Backend Structure
backend/
├── app/
│   ├── auth/            # Login & registration
│   ├── accounts/        # Bank accounts
│   ├── transactions/    # Income & expenses
│   ├── budgets/         # Budget planning
│   ├── alerts/          # Budget & system alerts
│   ├── dashboard/       # Aggregated dashboard APIs
│   ├── models/          # SQLAlchemy models
│   ├── schemas/         # Pydantic schemas
│   ├── utils/           # JWT & password helpers
│   ├── database.py
│   ├── dependencies.py
│   └── main.py
├── tests/               # Manual service tests
├── requirements.txt
└── README.md

🚩 Implemented Features
🔐 Authentication

User registration & login

JWT token generation & validation

Role-based access support

Secure password hashing

🏦 Accounts

Multiple bank accounts per user

Balance tracking

Ownership enforcement

💳 Transactions

Income & expense transactions

Balance validation

Monthly spending aggregation

📊 Budgets

Category-wise budgets

Period-based limits

Budget vs actual calculation

Exceeded budget detection

🚨 Alerts

Budget exceeded alerts

Persistent alert storage

User-specific alert retrieval

📈 Dashboard

Account summary

Monthly spending

Budget vs actual

Alerts count

Unified dashboard overview endpoint

📌 Key API Endpoint
GET /dashboard/overview


Example response:

{
  "accounts": {
    "total_accounts": 2,
    "total_balance": 4500.0
  },
  "monthly_spending": {
    "month": "2025-12",
    "total_spent": 1200.0
  },
  "budgets": [
    {
      "budget_id": 6,
      "category": "food",
      "limit": 500.0,
      "spent": 300.0,
      "remaining": 200.0,
      "exceeded": false
    }
  ],
  "alerts_count": 1
}

🧪 Testing

Each module has a dedicated test file:

python -m tests.test_auth_service
python -m tests.test_accounts_service
python -m tests.test_transactions_service
python -m tests.test_budget_vs_actual
python -m tests.test_dashboard_overview


Tests run against the real database, not mocks.

🧠 Design Principles

Service-oriented architecture

No circular imports

Explicit dependency injection

Clear separation of concerns

Realistic production patterns

🚀 Status

✅ Backend is stable, tested, and milestone-complete
Ready for frontend integration and further analytics expansion.
