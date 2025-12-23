-- Migration: convert transactions.txn_type enum -> varchar(50)
-- Run this against a PostgreSQL database.

BEGIN;

-- 1) Change column type to text then to varchar to preserve values
ALTER TABLE transactions
  ALTER COLUMN txn_type TYPE VARCHAR(50)
  USING txn_type::text;

COMMIT;

-- Notes:
-- - If your DB is not PostgreSQL, adapt the statement accordingly.
-- - If you are using Alembic, prefer creating an Alembic revision instead.
