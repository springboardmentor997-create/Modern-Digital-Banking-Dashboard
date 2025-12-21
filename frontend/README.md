# Personal Finance Management Dashboard

## Overview

This project is a Personal Finance Management Dashboard built using React for the frontend.
It allows users to track accounts, transactions, bills, rewards, and budgets in one place with a clean, user-friendly UI.

The frontend is fully implemented and ready to be connected to backend APIs.

## Tech Stack

Frontend: React, JavaScript, Tailwind CSS

Icons: Lucide React

Auth: JWT (access_token stored in localStorage)

API Communication: REST APIs using fetch

## What Has Been Implemented (Frontend)
Authentication

JWT-based authentication

Authorization: Bearer <access_token> used for all secured API calls

User-specific data handling (via token)

## Accounts Module

Display user bank accounts

Show account type and current balance

Supports multiple accounts per user

Expected features:

List accounts

Add / update / delete accounts

Auto-link accounts to transactions

## Transactions Module

View all transactions per user

Supports:

Income & Expense

Date, amount, category, description

Transaction summaries and history view

Expected features:

Create transaction

Fetch transactions by user

Filter by date, category, account

## Bills Module

Add, edit, delete bills

Track bill status:

upcoming

paid

overdue

Auto-pay flag supported

Bill summary cards (total due, upcoming bills)

## Database mapping used:

Bills:
- id (PK)
- user_id (FK → Users.id)
- biller_name
- due_date
- amount_due
- status
- auto_pay
- created_at

## Rewards Module

Manage reward programs per user

Shows:

- Program name
- 
- Points balance

- Last updated timestamp

Database mapping used:

Rewards:
- id (PK)
- user_id (FK → Users.id)
- program_name
- points_balance
- last_updated

## Budgets Module

Set budgets by category

Track spent vs remaining amount

Monthly budget tracking

Expected features:

Create/update budget

Link transactions to budgets

Calculate remaining balance automatically

 ## What Is Required From Backend (API Expectations)
## Authentication

JWT-based authentication

Token endpoint:

POST /api/token/

## Accounts API
- GET    /api/accounts/
- POST   /api/accounts/
- PUT    /api/accounts/{id}/
- DELETE /api/accounts/{id}/

## Transactions API
- GET    /api/transactions/
- POST   /api/transactions/
- PUT    /api/transactions/{id}/
- DELETE /api/transactions/{id}/

## Bills API
- GET    /api/bills/
- POST   /api/bills/
- PUT    /api/bills/{id}/
- DELETE /api/bills/{id}/

## Rewards API
- GET    /api/rewards/
- POST   /api/rewards/
- PUT    /api/rewards/{id}/
- DELETE /api/rewards/{id}/

## Budgets API
- GET    /api/budgets/
- POST   /api/budgets/
- PUT    /api/budgets/{id}/
- DELETE /api/budgets/{id}/

## Backend Responsibilities

- Identify user via JWT token
- Automatically associate user_id
- Validate ownership of data
- Handle timestamps (created_at, last_updated)

Enforce enum values (status, transaction type)
