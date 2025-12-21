from fastapi import APIRouter
from typing import List

router = APIRouter(prefix="/rewards", tags=["rewards"])

@router.get("/", response_model=dict)
async def get_rewards():
    return {
        "points": 12500,
        "history": [],
        "available": [
            {
                "id": 1,
                "title": "$50 Gift Card",
                "description": "Amazon Gift Card",
                "cost": 5000
            },
            {
                "id": 2,
                "title": "Travel Voucher",
                "description": "$100 off your next flight",
                "cost": 10000
            },
            {
                "id": 3,
                "title": "Cash Back",
                "description": "$25 statement credit",
                "cost": 2500
            }
        ]
    }
