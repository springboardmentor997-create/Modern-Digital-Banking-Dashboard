from sqlalchemy.orm import Session
from app.alerts.schemas import AlertCreate, AlertUpdate
from typing import List, Optional
from datetime import datetime
from app.models.alert import Alert
from sqlalchemy import func, desc
class AlertService:
    
    @staticmethod
    def create_alert(db: Session, alert_data: AlertCreate, user_id: int) -> Alert:
        db_alert = Alert(
            user_id=user_id,
            alert_type=alert_data.alert_type,
            title=alert_data.title,
            message=alert_data.message,
            threshold_amount=alert_data.threshold_amount
        )
        db.add(db_alert)
        db.commit()
        db.refresh(db_alert)
        return db_alert
    
    @staticmethod
    def get_alerts(db: Session, user_id: int, unread_only: bool = False) -> List[Alert]:
        query = db.query(Alert).filter(Alert.user_id == user_id)
        if unread_only:
            query = query.filter(Alert.is_read == False)
        return query.order_by(desc(Alert.created_at)).all()
    
    @staticmethod
    def get_alert_by_id(db: Session, alert_id: int, user_id: int) -> Optional[Alert]:
        return db.query(Alert).filter(
            Alert.id == alert_id,
            Alert.user_id == user_id
        ).first()
    
    @staticmethod
    def update_alert(db: Session, alert_id: int, alert_data: AlertUpdate, user_id: int) -> Optional[Alert]:
        alert = AlertService.get_alert_by_id(db, alert_id, user_id)
        if not alert:
            return None
        
        for field, value in alert_data.dict(exclude_unset=True).items():
            setattr(alert, field, value)
        
        db.commit()
        db.refresh(alert)
        return alert
    
    @staticmethod
    def delete_alert(db: Session, alert_id: int, user_id: int) -> bool:
        alert = AlertService.get_alert_by_id(db, alert_id, user_id)
        if not alert:
            return False
        
        db.delete(alert)
        db.commit()
        return True
    
    @staticmethod
    def mark_as_read(db: Session, alert_id: int, user_id: int) -> Optional[Alert]:
        alert = AlertService.get_alert_by_id(db, alert_id, user_id)
        if not alert:
            return None
        
        alert.is_read = True
        db.commit()
        db.refresh(alert)
        return alert
    
    @staticmethod
    def trigger_alert(db: Session, alert_id: int, user_id: int) -> Optional[Alert]:
        alert = AlertService.get_alert_by_id(db, alert_id, user_id)
        if not alert:
            return None
        
        alert.triggered_at = datetime.utcnow()
        db.commit()
        db.refresh(alert)
        return alert
    
    @staticmethod
    def get_unread_count(db: Session, user_id: int) -> int:
        return db.query(Alert).filter(
            Alert.user_id == user_id,
            Alert.is_read == False
        ).count()