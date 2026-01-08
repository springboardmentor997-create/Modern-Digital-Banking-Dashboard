from sqlalchemy.orm import Session
from app.models.transaction import Transaction
from app.transactions.schemas import TransactionCreate
from datetime import datetime
import csv
from io import StringIO
from decimal import Decimal


from app.models.account import Account
from app.budgets.service import update_budget_spent

class TransactionService:
    @staticmethod
    def create_transaction(db: Session, account_id: int, transaction_data: TransactionCreate):
        # Create transaction and update account balance atomically
        new_transaction = Transaction(
            account_id=account_id,
            description=transaction_data.description,
            category=transaction_data.category,
            amount=transaction_data.amount,
            currency=transaction_data.currency,
            txn_type=transaction_data.txn_type,
            merchant=transaction_data.merchant,
            txn_date=transaction_data.txn_date
        )

        try:
            acct = db.query(Account).filter(Account.id == account_id).first()
            if acct:
                # Normalize to Decimal
                curr_balance = acct.balance if acct.balance is not None else Decimal("0")
                amt = transaction_data.amount if isinstance(transaction_data.amount, Decimal) else Decimal(str(transaction_data.amount))

                # Diagnostic logging: show intended update
                print(f"[TXN] Account {acct.id} balance before: {curr_balance} | txn_type={transaction_data.txn_type} amount={amt}")

                if transaction_data.txn_type == "debit":
                    acct.balance = curr_balance - amt
                else:
                    # treat any non-debit as credit
                    acct.balance = curr_balance + amt

                print(f"[TXN] Account {acct.id} balance after: {acct.balance}")

                db.add(acct)

            db.add(new_transaction)
            db.commit()
            db.refresh(new_transaction)

            # If we have the account and it belongs to a user, update matching budget's spent amount
            try:
                if acct and getattr(acct, 'user_id', None) is not None:
                    update_budget_spent(db, new_transaction, acct.user_id)
            except Exception:
                # Do not fail transaction creation if budget update errors; fail silently
                pass

            # refresh account if present
            if acct:
                try:
                    db.refresh(acct)
                except Exception:
                    pass

            return new_transaction
        except Exception:
            db.rollback()
            raise
    
    @staticmethod
    def get_account_transactions(db: Session, account_id: int, skip: int = 0, limit: int = 100):
        return db.query(Transaction).filter(
            Transaction.account_id == account_id
        ).order_by(Transaction.created_at.desc()).offset(skip).limit(limit).all()

    @staticmethod
    def get_user_transactions(db: Session, user_id: int, skip: int = 0, limit: int = 100):
        """Return transactions for all accounts belonging to given user_id."""
        # join with Account via relationship or account_id -> accounts table
        from app.models.account import Account

        return db.query(Transaction).join(Account, Transaction.account_id == Account.id).filter(
            Account.user_id == user_id
        ).order_by(Transaction.created_at.desc()).offset(skip).limit(limit).all()
    
    @staticmethod
    def get_transaction_by_id(db: Session, transaction_id: int, account_id: int):
        return db.query(Transaction).filter(
            Transaction.id == transaction_id,
            Transaction.account_id == account_id
        ).first()
    
    @staticmethod
    def import_csv(db: Session, account_id: int, csv_content: str):
        """Import transactions from CSV content.

        Returns a summary dict with inserted/skipped counts and errors.
        """
        reader = csv.DictReader(StringIO(csv_content))
        expected_cols = ['description', 'category', 'amount', 'currency', 'txn_type', 'merchant', 'txn_date']

        # Validate header
        if reader.fieldnames is None:
            raise ValueError("CSV has no header row")

        header = [h.strip() for h in reader.fieldnames]
        missing = [c for c in expected_cols if c not in header]
        if missing:
            raise ValueError(f"Missing required CSV columns: {', '.join(missing)}")

        valid_transactions = []
        errors = []
        inserted = 0
        skipped = 0

        # Load account for optional balance update
        acct = db.query(Account).filter(Account.id == account_id).first()
        from decimal import Decimal, InvalidOperation

        # use starting balance if present
        curr_balance = Decimal(str(acct.balance)) if (acct and acct.balance is not None) else Decimal("0")

        # Iterate rows with a row counter (data rows start after header)
        for idx, row in enumerate(reader, start=2):
            # Normalize keys by stripping whitespace from values
            try:
                desc = (row.get('description') or '').strip()
                category = (row.get('category') or '').strip()
                amount_raw = (row.get('amount') or '').strip()
                currency = (row.get('currency') or '').strip() or 'USD'
                txn_type_raw = (row.get('txn_type') or '').strip()
                merchant_raw = (row.get('merchant') or '').strip()
                txn_date_raw = (row.get('txn_date') or '').strip()
            except Exception:
                errors.append({"row_number": idx, "reason": "Malformed row or missing columns"})
                skipped += 1
                continue

            # Validate amount
            try:
                amount = Decimal(amount_raw)
                if amount <= 0:
                    raise InvalidOperation()
            except Exception:
                errors.append({"row_number": idx, "reason": f"Invalid amount: '{amount_raw}'"})
                skipped += 1
                continue

            # Validate txn_type
            ttype = txn_type_raw.lower()
            if ttype == 'debit':
                store_type = 'debit'
            elif ttype == 'credit':
                store_type = 'credit'
            else:
                errors.append({"row_number": idx, "reason": f"Invalid txn_type: '{txn_type_raw}'"})
                skipped += 1
                continue

            # Parse txn_date
            try:
                txn_date = datetime.fromisoformat(txn_date_raw.replace('Z', '+00:00'))
            except Exception:
                errors.append({"row_number": idx, "reason": f"Invalid txn_date: '{txn_date_raw}'"})
                skipped += 1
                continue

            merchant = merchant_raw if merchant_raw != '' else None

            # Build Transaction object
            txn = Transaction(
                account_id=account_id,
                description=desc or None,
                category=category or None,
                amount=amount,
                currency=currency,
                txn_type=store_type,
                merchant=merchant,
                txn_date=txn_date
            )

            # Accumulate for bulk insert and balance update
            valid_transactions.append(txn)

            # Update running balance
            if store_type == 'debit':
                curr_balance = curr_balance - amount
            else:
                curr_balance = curr_balance + amount

        # Insert valid transactions
        try:
            if valid_transactions:
                # update account balance if account exists
                if acct:
                    acct.balance = curr_balance
                    db.add(acct)

                db.add_all(valid_transactions)
                db.commit()
                inserted = len(valid_transactions)
            else:
                inserted = 0

        except Exception:
            db.rollback()
            raise

        skipped = skipped + (0)  # already incremented during iteration

        return {
            "account_id": account_id,
            "inserted_count": inserted,
            "skipped_count": skipped,
            "errors": errors
        }
