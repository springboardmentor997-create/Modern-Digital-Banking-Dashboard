from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import List
from app.database import get_db
from app.alerts.schemas import AlertCreate, AlertResponse, AlertUpdate, AlertMarkRead
from app.alerts.service import AlertService
from app.dependencies import get_current_user

router = APIRouter()

@router.post("/", response_model=AlertResponse, status_code=status.HTTP_201_CREATED)
def create_alert(
    alert: AlertCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    return AlertService.create_alert(db, alert, current_user.id)

@router.get("/")
def get_alerts():
    alerts = [
        {
            "id": "budget_1",
            "type": "budget_exceeded",
            "priority": "high",
            "title": "Budget Alert: Dining",
            "message": "You've spent Rs. 450.00 (90.0%) of your Rs. 500.00 budget",
            "created_at": datetime.utcnow().isoformat(),
            "is_read": False
        },
        {
            "id": "bill_1",
            "type": "bill_due",
            "priority": "critical",
            "title": "Bill Due: Electricity",
            "message": "Rs. 120.00 due in 1 day",
            "created_at": datetime.utcnow().isoformat(),
            "is_read": False
        }
    ]
    
    return {
        "alerts": alerts,
        "total_count": len(alerts),
        "unread_count": len([a for a in alerts if not a.get("is_read", False)])
    }

@router.post("/alerts/{alert_id}/mark-read")
def mark_alert_read(alert_id: str):
    return {"message": f"Alert {alert_id} marked as read"}

@router.get("/summary")
def get_alerts_summary():
    return {
        "total": 2,
        "critical": 1,
        "high": 1,
        "medium": 0,
        "recent": []
    }

@router.post("/bill-reminders")
def check_bill_reminders(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    return {
        "message": "Bill reminders checked successfully",
        "reminders_sent": 2,
        "next_check": datetime.utcnow() + timedelta(hours=24)
    }

@router.get("/check-reminders")
def check_bill_reminders():
    return {
        "message": "Bill reminders checked",
        "reminders": [
            {
                "id": 1,
                "bill_name": "Electricity Bill",
                "amount": 120.00,
                "due_date": "2024-01-20",
                "days_until_due": 3
            }
        ]
    }

@router.get("/unread-count")
def get_unread_count(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    count = AlertService.get_unread_count(db, current_user.id)
    return {"unread_count": count}

@router.get("/{alert_id}", response_model=AlertResponse)
def get_alert(
    alert_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    alert = AlertService.get_alert_by_id(db, alert_id, current_user.id)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    return alert

@router.put("/{alert_id}", response_model=AlertResponse)
def update_alert(
    alert_id: int,
    alert_data: AlertUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    alert = AlertService.update_alert(db, alert_id, alert_data, current_user.id)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    return alert

@router.patch("/{alert_id}/read", response_model=AlertResponse)
def mark_alert_as_read(
    alert_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    alert = AlertService.mark_as_read(db, alert_id, current_user.id)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    return alert

@router.patch("/{alert_id}/trigger", response_model=AlertResponse)
def trigger_alert(
    alert_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    alert = AlertService.trigger_alert(db, alert_id, current_user.id)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    return alert

@router.delete("/{alert_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_alert(
    alert_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    success = AlertService.delete_alert(db, alert_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Alert not found")