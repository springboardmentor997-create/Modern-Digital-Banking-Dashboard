from fastapi import APIRouter
from typing import List
from datetime import datetime, timedelta

router = APIRouter(prefix="/bills", tags=["bills"])

@router.get("/", response_model=List[dict])
async def get_bills():
    return [
        {
            "id": 1,
            "name": "Electric Bill",
            "dueDate": (datetime.now() + timedelta(days=5)).isoformat(),
            "amount": 120.50,
            "status": "pending",
            "autoPay": True
        },
        {
            "id": 2,
            "name": "Internet",
            "dueDate": (datetime.now() + timedelta(days=10)).isoformat(),
            "amount": 60.00,
            "status": "pending",
            "autoPay": True
        },
        {
            "id": 3,
            "name": "Rent",
            "dueDate": (datetime.now() - timedelta(days=2)).isoformat(),
            "amount": 1200.00,
            "status": "overdue",
            "autoPay": False
        }
    ]
