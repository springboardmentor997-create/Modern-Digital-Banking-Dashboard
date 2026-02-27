from app.database import SessionLocal
from app.models.bill import Bill
from app.models.user import User

def clear_bills():
    db = SessionLocal()
    try:
        print("Cleaning up bills...")
        # Delete all bills
        deleted_count = db.query(Bill).delete()
        db.commit()
        print(f"✅ Deleted {deleted_count} bills from the database.")
    except Exception as e:
        print(f"Error clearing bills: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    clear_bills()
