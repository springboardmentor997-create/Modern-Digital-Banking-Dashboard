from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.database import get_db
from app.dependencies import get_current_user
from app.models.alert import Alert, AlertType

router = APIRouter()

class AlertCreate(BaseModel):
    title: str
    message: str
    priority: str = "info"  # accepts 'info', 'high', 'critical' or concrete alert type names

# Mapping from generic priority to internal AlertType values
PRIORITY_TO_ALERT_TYPE = {
    'info': 'low_balance',
    'low': 'low_balance',
    'low_balance': 'low_balance',
    'high': 'bill_due',
    'bill_due': 'bill_due',
    'critical': 'budget_exceeded',
    'budget_exceeded': 'budget_exceeded'
}

@router.get("/")
def get_alerts(current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    alerts = db.query(Alert).filter(Alert.user_id == current_user.id).order_by(Alert.created_at.desc()).all()
    
    # Create sample alert if none exist
    if not alerts:
        sample_alert = Alert(
            user_id=current_user.id,
            type=AlertType.low_balance,
            message="Welcome to your banking dashboard. Start by adding transactions."
        )
        db.add(sample_alert)
        db.commit()
        alerts = [sample_alert]
    
    return [
        {
            "id": alert.id,
            "title": alert.message,  # Use message as title for compatibility
            "message": alert.message,
            "alert_type": alert.type.value,
            "type": alert.type.value,
            "is_read": alert.is_read,
            "created_at": alert.created_at.isoformat()
        } for alert in alerts
    ]

@router.get("")
def get_alerts_no_slash(current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    """Duplicate endpoint without trailing slash for compatibility"""
    return get_alerts(current_user, db)

@router.post("/")
def create_alert(payload: AlertCreate, current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    # Determine internal alert type from priority or explicit type names
    raw = (payload.priority or 'info').lower()
    mapped = PRIORITY_TO_ALERT_TYPE.get(raw)
    if not mapped:
        raise HTTPException(status_code=422, detail=f"Invalid priority or alert_type: {payload.priority}")

    try:
        alert_type_enum = AlertType(mapped)
    except ValueError:
        raise HTTPException(status_code=422, detail=f"Invalid alert type mapping: {mapped}")

    alert = Alert(
        user_id=current_user.id,
        type=alert_type_enum,
        message=payload.message
    )
    db.add(alert)
    db.commit()
    db.refresh(alert)
    
    return {
        "id": alert.id,
        "title": alert.message,
        "message": alert.message,
        "alert_type": alert.type.value,
        "is_read": alert.is_read,
        "created_at": alert.created_at.isoformat()
    }

@router.post("")
def create_alert_no_slash(payload: AlertCreate, current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    """Duplicate endpoint without trailing slash for compatibility"""
    return create_alert(payload, current_user, db)
@router.patch("/{alert_id}/read")
def mark_alert_as_read(alert_id: int, current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    alert = db.query(Alert).filter(Alert.id == alert_id, Alert.user_id == current_user.id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    alert.is_read = True
    db.commit()
    
    return {"message": "Alert marked as read"}

@router.put("/{alert_id}")
def update_alert(alert_id: int, payload: AlertCreate, current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    alert = db.query(Alert).filter(Alert.id == alert_id, Alert.user_id == current_user.id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    # Update alert fields
    raw = (payload.priority or 'info').lower()
    mapped = PRIORITY_TO_ALERT_TYPE.get(raw)
    if not mapped:
        raise HTTPException(status_code=422, detail=f"Invalid priority or alert_type: {payload.priority}")

    try:
        alert_type_enum = AlertType(mapped)
    except ValueError:
        raise HTTPException(status_code=422, detail=f"Invalid alert type mapping: {mapped}")
    
    alert.type = alert_type_enum
    alert.message = payload.message
    
    db.commit()
    db.refresh(alert)
    
    return {
        "id": alert.id,
        "title": alert.message,
        "message": alert.message,
        "alert_type": alert.type.value,
        "is_read": alert.is_read,
        "created_at": alert.created_at.isoformat()
    }

@router.delete("/{alert_id}")
def delete_alert(alert_id: int, current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    alert = db.query(Alert).filter(Alert.id == alert_id, Alert.user_id == current_user.id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    db.delete(alert)
    db.commit()
    
    return {"message": "Alert deleted successfully"}

@router.get("/check-reminders")
def check_reminders(current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    # Simple endpoint that returns empty array to prevent 404 errors
    return []

@router.post("/bill-reminders")
def check_bill_reminders(current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    # Return empty array for now - no reminders
    return {
        "reminders": [],
        "count": 0
    }

@router.get("/summary")
def get_alerts_summary(current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    alerts = db.query(Alert).filter(Alert.user_id == current_user.id).all()
    
    # Since the Alert model doesn't have priority field, we'll categorize by type
    critical = sum(1 for alert in alerts if alert.type == "budget_exceeded")
    high = sum(1 for alert in alerts if alert.type == "bill_due")
    medium = sum(1 for alert in alerts if alert.type == "low_balance")
    
    return {
        "total": len(alerts),
        "critical": critical,
        "high": high,
        "medium": medium,
        "recent": []
    }

@router.get("/summary/")
def get_alerts_summary_with_slash(current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    """Duplicate endpoint with trailing slash for compatibility"""
    return get_alerts_summary(current_user, db)