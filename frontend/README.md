# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.



# 🏦 Modern Digital Banking Dashboard – Frontend

This repository contains the **frontend implementation** of the Modern Digital Banking Dashboard.  
The application focuses on **secure digital payments**, **account management**, and a **realistic banking user experience**, similar to real-world banking apps.

---

## 🛠 Tech Stack

- React (Vite)
- Tailwind CSS
- React Router DOM
- Axios
- Lucide Icons

---

## 📁 Frontend Folder Structure

src/
│
├── assets/ # Images, logos, icons
├── components/ # Reusable UI components
├── pages/ # Route-based pages
├── services/ # API service layer
├── layouts/ # Dashboard layout
├── context/ # Global state (auth, future use)
├── App.jsx # Application routing
└── main.jsx # Application entry point


---

## 🔐 Transaction PIN Design

- Transaction PIN is **created during Add Account**
- PIN is created **only once**
- Same PIN is reused for:
  - UPI payments
  - Bank transfers
  - Self account transfers
- PIN is verified using a reusable modal
- For demo purposes, PIN is stored in `localStorage`

> If no bank account exists, user must **add an account first** before making payments.

---

## 💳 Payments Module (Completed)

### Entry Page
- **SendMoney.jsx**
  - Acts as the central payments hub
  - User selects an account
  - Chooses payment method

### Payment Types Implemented

| Payment Type | File |
|-------------|------|
| UPI / Mobile | SendToUpi.jsx |
| Self Transfer | SendToSelf.jsx |
| Bank Transfer | SendToBank.jsx |

---

## ✅ Common Payment Features

- Input validation (UPI, mobile, IFSC, account number)
- Inline error messages
- Send button disabled until inputs are valid
- Transaction PIN confirmation
- Background blur during PIN entry
- Simulated payment processing
- Success / Failure handling
- Receipt download & share
- Retry and Home navigation

---

## 📄 Page Responsibilities

### 🔹 SendToUpi.jsx
- Validates UPI ID or mobile number
- Validates amount
- Opens PIN modal
- Routes to success or failure page

### 🔹 SendToSelf.jsx
- Transfers money between user’s own accounts
- Fetches accounts from backend
- Requires valid amount and PIN

### 🔹 SendToBank.jsx
- Validates account number and IFSC
- Shows inline validation errors
- Requires PIN before transfer

---

## 🔑 PIN Verification

### EnterPinModal.jsx
- Reusable modal component
- 4-digit masked PIN input
- Confirm button enabled only for valid PIN length
- Used across all payment flows

---

## ⏳ Payment Processing

### PaymentProcessing.jsx
- Simulates real banking delay
- Shown after PIN confirmation
- Improves UX realism

---

## ✅ Payment Success

### PaymentSuccess.jsx
- Displays transaction details:
  - Recipient
  - Amount
  - Mode
  - Time
- Allows:
  - Receipt download
  - Receipt sharing
  - Return to payments

---

## ❌ Payment Failure

### PaymentFailed.jsx
- Displays failed transaction details
- Allows:
  - Retry payment
  - Download receipt
  - Share receipt
  - Navigate home

---

## 🧩 Reusable Components

- EnterPinModal – Transaction PIN verification
- PaymentProcessing – Loader after PIN confirmation
- Breadcrumbs – Navigation hierarchy
- DashboardSummary – Account & balance overview
- TransactionFilter – Filter transaction history
- FAQ – Help & support content
- Navbar / Footer – Layout components

---

## 🔗 Backend Integration

- API calls handled via `services/api.js`
- Axios instance with token attachment
- Protected routes enforced on dashboard pages

---

## 🧪 Demo Notes

- PIN verification is frontend-only (demo)
- Payment success/failure is simulated
- Backend integration planned for:
  - PIN verification
  - Transaction persistence

---

## ▶️ Run the Frontend

```bash
cd frontend
npm install
npm run dev


Application runs at:
http://localhost:5173

