from fastapi import APIRouter
from typing import List
from datetime import datetime

router = APIRouter(prefix="/alerts", tags=["alerts"])

@router.get("/", response_model=List[dict])
async def get_alerts():
    return [
        {
            "id": 1,
            "type": "warning",
            "title": "Low Balance",
            "message": "Your checking account balance is below $100.",
            "date": datetime.now().isoformat(),
            "read": False
        },
        {
            "id": 2,
            "type": "success",
            "title": "Payment Received",
            "message": "You received a payment of $500.00.",
            "date": datetime.now().isoformat(),
            "read": True
        },
        {
            "id": 3,
            "type": "info",
            "title": "New Feature",
            "message": "Check out the new budgeting tools!",
            "date": datetime.now().isoformat(),
            "read": False
        }
    ]

@router.put("/{id}/read")
async def mark_alert_as_read(id: int):
    return {"message": "Alert marked as read"}
