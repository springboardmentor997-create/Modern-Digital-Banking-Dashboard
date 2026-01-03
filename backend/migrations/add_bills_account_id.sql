-- Migration: add account_id column to bills table and FK to accounts(id)
-- This migration is idempotent: it only adds the column/constraint if they don't exist.

DO $$
BEGIN
    -- Add column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name='bills' AND column_name='account_id'
    ) THEN
        ALTER TABLE bills ADD COLUMN account_id INTEGER;
    END IF;

    -- Add FK constraint if missing (name: bills_account_id_fkey)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_name = 'bills' AND tc.constraint_type = 'FOREIGN KEY' AND kcu.column_name = 'account_id'
    ) THEN
        ALTER TABLE bills
        ADD CONSTRAINT bills_account_id_fkey FOREIGN KEY (account_id)
        REFERENCES accounts(id) ON DELETE CASCADE;
    END IF;
END$$;
