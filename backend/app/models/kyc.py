from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import datetime
import enum

class DocumentType(enum.Enum):
    PASSPORT = "passport"
    DRIVERS_LICENSE = "drivers_license"
    NATIONAL_ID = "national_id"
    UTILITY_BILL = "utility_bill"

class KYCDocument(Base):
    __tablename__ = "kyc_documents"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    full_name = Column(String, nullable=True)
    date_of_birth = Column(String, nullable=True)
    address = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    document_type = Column(Enum(DocumentType), nullable=False)
    document_number = Column(String, nullable=True)
    document_url = Column(String, nullable=True)  # Keep for backward compatibility
    document_front_url = Column(String, nullable=True)
    document_back_url = Column(String, nullable=True)
    status = Column(String, default="pending")
    submitted_at = Column(DateTime, default=datetime.utcnow)
    verification_date = Column(DateTime, nullable=True)
    rejection_reason = Column(String, nullable=True)
    verified_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="kyc_documents", foreign_keys=[user_id])
    verifier = relationship("User", foreign_keys=[verified_by])

class KYCVerificationLog(Base):
    __tablename__ = "kyc_verification_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    kyc_document_id = Column(Integer, ForeignKey("kyc_documents.id"), nullable=False)
    admin_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    action = Column(String, nullable=False)
    comments = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    document = relationship("KYCDocument")
    admin = relationship("User")