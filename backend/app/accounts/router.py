from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.account import Account
from app.schemas.account import AccountCreate, AccountOut

router = APIRouter(prefix="/accounts", tags=["Accounts"])

@router.post("/", response_model=AccountOut)
def create_account(data: AccountCreate, db: Session = Depends(get_db)):
    acc = Account(**data.dict(), user_id=1)
    db.add(acc)
    db.commit()
    db.refresh(acc)
    return acc

@router.get("/", response_model=list[AccountOut])
def list_accounts(db: Session = Depends(get_db)):
    return db.query(Account).all()
