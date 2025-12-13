# Tivra – Modern Banking Management App

## 🚀 What Has Been Implemented (Frontend)

### 🧩 Tech Stack

* **React** (Hooks-based architecture)
* **Tailwind CSS** (UI & responsiveness)
* **Lucide Icons** (Iconography)
* **React Router** (Routing)
* **JWT-based Auth (Token stored in localStorage)**

---

## 📌 Core Features Implemented

### 1️⃣ Accounts Module (`Accounts.jsx`)

**Purpose:** Manage user bank accounts in one place.

#### Features:

* Fetch all user accounts (`GET /api/accounts`)
* Add new bank account (`POST /api/accounts`)
* Edit existing account (`PUT /api/accounts/{id}`)
* Delete account (`DELETE /api/accounts/{id}`)
* Modal-based Add/Edit UI
* Client-side validations:

  * Required bank name
  * Valid account type
  * Last 4 digits validation
  * Numeric balance validation
* Supports multiple account types:

  * Savings, Checking, Credit Card, Investment, Loan
* Multi-currency support
* Masked account number display
* Gradient-based UI cards per account type

---

### 2️⃣ Transactions Module (`Transactions.jsx`)

**Purpose:** Track, analyze, import, export financial transactions.

#### Features:

* Fetch all transactions (`GET /api/transactions`)
* Advanced filtering:

  * Search (description / merchant)
  * Category
  * Type (credit/debit)
  * Date range
* CSV Import (`POST /api/transactions/import-csv`)
* CSV Export (client-side)
* Transaction summary cards:

  * Total Income
  * Total Expenses
  * Net Balance
* Detailed transaction view modal
* Transaction categorization
* Income / Expense indicators

#### Expected CSV Format:

```
description, category, amount, currency, txn_type, merchant, txn_date
```

---

### 3️⃣ Budgets Module (`Budgets.jsx`)

**Purpose:** Monthly budget planning & tracking.

#### Features:

* Fetch budgets by month & year (`GET /api/budgets?month=&year=`)
* Create budget (`POST /api/budgets`)
* Edit budget (`PUT /api/budgets/{id}`)
* Delete budget (`DELETE /api/budgets/{id}`)
* Category-wise budgets
* Progress bars with color-coded thresholds
* Budget status indicators:

  * On Track
  * High
  * Critical
  * Exceeded
* Monthly & yearly selection
* Summary cards:

  * Total Budget
  * Total Spent
  * Remaining Amount

---

## 🔐 Authentication (Assumed / Partially Integrated)

* JWT token expected in `localStorage`:

  ```js
  localStorage.getItem('access_token')
  ```
* All protected APIs send token via:

  ```http
  Authorization: Bearer <token>
  ```

⚠️ **Frontend assumes authentication already exists**.

---

## 🧱 What Is Required for Backend (API Contract)

### 🔑 Authentication APIs

| Method | Endpoint           | Description              |
| ------ | ------------------ | ------------------------ |
| POST   | /api/auth/register | User registration        |
| POST   | /api/auth/login    | User login (returns JWT) |
| GET    | /api/auth/me       | Get logged-in user       |

---

### 🏦 Accounts APIs

| Method | Endpoint           | Description        |
| ------ | ------------------ | ------------------ |
| GET    | /api/accounts      | List user accounts |
| POST   | /api/accounts      | Create account     |
| PUT    | /api/accounts/{id} | Update account     |
| DELETE | /api/accounts/{id} | Delete account     |

**Account Model (Expected):**

```json
{
  "id": 1,
  "bank_name": "Chase Bank",
  "account_type": "Savings",
  "masked_account": "1234",
  "currency": "USD",
  "balance": 8450.00,
  "created_at": "2025-01-01T10:00:00"
}
```

---

### 💳 Transactions APIs

| Method | Endpoint                     | Description        |
| ------ | ---------------------------- | ------------------ |
| GET    | /api/transactions            | Fetch transactions |
| POST   | /api/transactions/import-csv | Import CSV         |

**Transaction Model:**

```json
{
  "id": 1,
  "description": "Grocery Store",
  "merchant": "Walmart",
  "category": "Food",
  "txn_type": "debit",
  "amount": 120.50,
  "currency": "USD",
  "txn_date": "2025-01-10",
  "posted_date": "2025-01-11"
}
```

---

### 📊 Budgets APIs

| Method | Endpoint          | Description                 |
| ------ | ----------------- | --------------------------- |
| GET    | /api/budgets      | Fetch budgets by month/year |
| POST   | /api/budgets      | Create budget               |
| PUT    | /api/budgets/{id} | Update budget               |
| DELETE | /api/budgets/{id} | Delete budget               |

**Budget Model:**

```json
{
  "id": 1,
  "month": 1,
  "year": 2025,
  "category": "Food",
  "limit_amount": 1000.00,
  "spent_amount": 450.75
}
```

---

## 🛠 Recommended Backend Stack

* **FastAPI (Python)** or **Django REST Framework**
* **PostgreSQL** (preferred)
* **SQLAlchemy / Django ORM**
* **JWT Authentication**
* **CORS enabled**
* **CSV parsing support**

---


✨ *Frontend completed. Backend integration pending.*
