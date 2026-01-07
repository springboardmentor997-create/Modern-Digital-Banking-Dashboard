from app.database import SessionLocal
from app.models.account import Account
from app.models.user import User   # ✅ THIS FIXES THE ERROR
from app.utils.hashing import Hash

db = SessionLocal()

accounts = db.query(Account).filter(Account.pin_hash == None).all()

for acc in accounts:
    acc.pin_hash = Hash.bcrypt("0000")

db.commit()
db.close()

print("✅ Updated old accounts with default PIN")
