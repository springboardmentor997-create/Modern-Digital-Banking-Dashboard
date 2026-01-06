# Backend helper scripts and tests

This folder contains utility scripts under `backend/scripts/` for local development and basic checks.

Available scripts:

- `run_create_account_test.py` — creates a test user (if missing) and attempts to create an account via the API using a generated test token; cleans up the account.
- `run_post_test.py` — creates a test account and posts a debit transaction via the API using a generated token; performs cleanup after running.
- `activate_admin.py` — activates the admin user if present.
- `check_admin.py` — inspects admin credentials and optionally fixes the admin password.
- `reset_db_connections.py` — wrapper delegating to `app.database.reset_db_connections()`.
- `reset_transactions.py` — tries to terminate idle-in-transaction backends for PostgreSQL safely.
- `init_sample_data.py` — create sample users, accounts, alerts, rewards for local development.
- `check_profile_accounts.py` — exercises profile endpoints: create multiple accounts for a test user, list them, and switch the active account to validate behavior.
- `test_db_connection.py` — a simple script that runs DB connectivity and transaction tests.

Profile enhancements:
- `GET /api/profile/accounts` — list all accounts for the current user and indicate which one is active.
- `POST /api/profile/accounts/active` — set the active account for the current user by providing `{ "account_id": <id> }` in the request body.

The backend will now set the first created account for a user as their active account automatically.

Docker / Postgres (local dev) 🐘

To run Postgres locally using Docker Compose (recommended):

1. Start Postgres + pgAdmin:
   - From the repo root: `docker compose up -d`
   - This will expose Postgres at `localhost:5432` with:
     - user: `postgres`
     - password: `postgrespw`
     - db: `banking_db`
   - pgAdmin will be available at `http://localhost:8080` (login: `admin@local` / `pgadmin`).

2. Use the sample connection string in `backend/.env.example` or copy to your `.env`:
   - `DATABASE_URL=postgresql://postgres:postgrespw@localhost:5432/banking_db`

3. Start the backend (from repo root):
   - `cd backend`
   - Ensure env vars are loaded (Windows PowerShell example):
     - `$env:DATABASE_URL = "postgresql://postgres:postgrespw@localhost:5432/banking_db"`
   - `python -m uvicorn app.main:app --reload --port 8000 --host 127.0.0.1`

Notes:
- If your database password contains special characters (for example `@` or `:`), percent-encode them. Example: password `Urmila@258619` → `Urmila%40258619` so the URL becomes `postgresql://postgres:Urmila%40258619@localhost:5433/banking_db`.
- Use the correct port (you are using `5433`) when setting `DATABASE_URL` if your Postgres listens on a non-default port.
- The app will now attempt a few retries to connect to Postgres at startup (configurable via `DB_WAIT_RETRIES` and `DB_WAIT_DELAY`).
- If you prefer not to use Docker, make sure a local Postgres is running and that `DATABASE_URL` matches your credentials.


Usage:

1. Activate your Python virtualenv and install dependencies:

   pip install -r requirements.txt

2. Ensure your `.env` is configured (copy `.env.example` if needed).

3. From repo root run:

   python backend/scripts/run_create_account_test.py
   python backend/scripts/run_post_test.py

Notes:
- The test scripts create a `test@example.com` user if it does not exist and generate a short-lived test token compatible with the simple token format used by `app.dependencies.get_current_user`.
- The scripts try to clean up resources they create. If you run integration tests repeatedly, you may want to reset test data via `backend/scripts/reset_transactions.py`.
