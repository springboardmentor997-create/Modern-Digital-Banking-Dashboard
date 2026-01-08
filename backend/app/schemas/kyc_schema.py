from pydantic import BaseModel, validator
from typing import Optional
from datetime import datetime
from enum import Enum

class DocumentTypeEnum(str, Enum):
    aadhaar = "aadhaar"
    pan = "pan"
    passport = "passport"
    driving_license = "driving_license"
    voter_id = "voter_id"

class KYCStatusEnum(str, Enum):
    pending = "pending"
    under_review = "under_review"
    verified = "verified"
    rejected = "rejected"

class KYCSubmissionSchema(BaseModel):
    full_name: str
    date_of_birth: str
    address: str
    phone: str
    document_type: DocumentTypeEnum
    document_number: str
    
    @validator('document_number')
    def validate_document_number(cls, v, values):
        doc_type = values.get('document_type')
        if doc_type == DocumentTypeEnum.aadhaar and len(v) != 12:
            raise ValueError('Aadhaar number must be 12 digits')
        elif doc_type == DocumentTypeEnum.pan and len(v) != 10:
            raise ValueError('PAN number must be 10 characters')
        return v
    
    @validator('phone')
    def validate_phone(cls, v):
        if len(v) != 10 or not v.isdigit():
            raise ValueError('Phone number must be 10 digits')
        return v

class KYCDocumentResponse(BaseModel):
    id: int
    full_name: str
    document_type: str
    document_number: str
    status: str
    submitted_at: datetime
    verification_date: Optional[datetime]
    rejection_reason: Optional[str]
    
    class Config:
        from_attributes = True

class KYCVerificationSchema(BaseModel):
    action: str  # "approved", "rejected", "requested_changes"
    comments: Optional[str] = None
    
    @validator('action')
    def validate_action(cls, v):
        if v not in ['approved', 'rejected', 'requested_changes']:
            raise ValueError('Action must be approved, rejected, or requested_changes')
        return v

class KYCStatusResponse(BaseModel):
    kyc_status: str
    document_type: Optional[str]
    submitted_at: Optional[datetime]
    verification_date: Optional[datetime]
    rejection_reason: Optional[str]
    message: Optional[str]