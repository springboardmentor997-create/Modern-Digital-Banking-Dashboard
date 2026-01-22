from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User, UserRole, KYCStatus
from app.models.kyc import KYCDocument, KYCVerificationLog, DocumentType
from app.services.kyc_verification import KYCVerificationService
from pydantic import BaseModel
from typing import Optional, List
import os
import uuid
from datetime import datetime

router = APIRouter(prefix="/api/kyc", tags=["KYC"])

# Pydantic Models
class KYCSubmission(BaseModel):
    full_name: str
    date_of_birth: str
    address: str
    phone: str
    document_type: DocumentType
    document_number: str

class KYCVerification(BaseModel):
    action: str  # "approved", "rejected", "requested_changes"
    comments: Optional[str] = None

class KYCResponse(BaseModel):
    id: int
    full_name: str
    document_type: str
    document_number: str
    status: str
    submitted_at: datetime
    verification_date: Optional[datetime]
    rejection_reason: Optional[str]

# File upload directory
UPLOAD_DIR = "uploads/kyc_documents"
os.makedirs(UPLOAD_DIR, exist_ok=True)

def save_uploaded_file(file: UploadFile) -> str:
    """Save uploaded file and return file path"""
    file_extension = file.filename.split('.')[-1]
    unique_filename = f"{uuid.uuid4()}.{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    with open(file_path, "wb") as buffer:
        buffer.write(file.file.read())
    
    return file_path

@router.post("/submit")
def submit_kyc_documents(
    full_name: str = Form(...),
    date_of_birth: str = Form(...),
    address: str = Form(...),
    phone: str = Form(...),
    document_type: DocumentType = Form(...),
    document_number: str = Form(...),
    document_front: UploadFile = File(...),
    document_back: Optional[UploadFile] = File(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Submit KYC documents for verification"""
    
    # Initialize verification service
    kyc_service = KYCVerificationService()
    
    # Check if user already has pending/verified KYC
    existing_kyc = db.query(KYCDocument).filter(
        KYCDocument.user_id == current_user.id,
        KYCDocument.status.in_([KYCStatus.pending, KYCStatus.under_review, KYCStatus.verified])
    ).first()
    
    if existing_kyc:
        if existing_kyc.status == KYCStatus.verified:
            raise HTTPException(status_code=400, detail="KYC already verified")
        else:
            raise HTTPException(status_code=400, detail="KYC submission already pending")
    
    # Prepare KYC data for verification
    kyc_data = {
        'full_name': full_name,
        'date_of_birth': date_of_birth,
        'address': address,
        'phone': phone,
        'document_type': document_type.value,
        'document_number': document_number
    }
    
    # Perform document validation
    verification_result = kyc_service.perform_verification(kyc_data)
    
    # Check if document number is valid
    if not verification_result['document_validation']['valid']:
        raise HTTPException(
            status_code=400, 
            detail=f"Document validation failed: {verification_result['document_validation']['message']}"
        )
    
    # Check personal info
    if not verification_result['personal_info_valid']:
        raise HTTPException(status_code=400, detail="Personal information validation failed")
    
    # Save uploaded files
    front_file_path = save_uploaded_file(document_front)
    back_file_path = save_uploaded_file(document_back) if document_back else None
    
    # Determine initial status based on verification
    if verification_result['overall_status'] == 'auto_approved':
        initial_status = KYCStatus.verified
        # Update user KYC status immediately
        current_user.kyc_status = "verified"
    else:
        initial_status = KYCStatus.pending
    
    # Create KYC document record
    kyc_document = KYCDocument(
        user_id=current_user.id,
        full_name=full_name,
        date_of_birth=date_of_birth,
        address=address,
        phone=phone,
        document_type=document_type,
        document_number=document_number,
        document_front_url=front_file_path,
        document_back_url=back_file_path,
        status=initial_status
    )
    
    if initial_status == KYCStatus.verified:
        kyc_document.verification_date = datetime.utcnow()
    
    db.add(kyc_document)
    db.commit()
    db.refresh(kyc_document)
    
    return {
        "message": "KYC documents submitted successfully",
        "kyc_id": kyc_document.id,
        "status": kyc_document.status.value,
        "verification_result": verification_result,
        "auto_approved": initial_status == KYCStatus.verified
    }

@router.get("/status")
def get_kyc_status(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user's KYC status"""
    
    kyc_document = db.query(KYCDocument).filter(
        KYCDocument.user_id == current_user.id
    ).order_by(KYCDocument.submitted_at.desc()).first()
    
    if not kyc_document:
        return {
            "kyc_status": "not_submitted",
            "message": "No KYC documents submitted"
        }
    
    return {
        "kyc_status": kyc_document.status.value,
        "document_type": kyc_document.document_type.value,
        "submitted_at": kyc_document.submitted_at,
        "verification_date": kyc_document.verification_date,
        "rejection_reason": kyc_document.rejection_reason
    }

@router.get("/documents")
def get_kyc_documents(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's KYC documents"""
    
    documents = db.query(KYCDocument).filter(
        KYCDocument.user_id == current_user.id
    ).order_by(KYCDocument.submitted_at.desc()).all()
    
    return {
        "documents": [
            {
                "id": doc.id,
                "full_name": doc.full_name,
                "document_type": doc.document_type.value,
                "document_number": doc.document_number,
                "status": doc.status.value,
                "submitted_at": doc.submitted_at,
                "verification_date": doc.verification_date,
                "rejection_reason": doc.rejection_reason
            }
            for doc in documents
        ]
    }

# Admin endpoints for KYC verification
@router.get("/admin/pending")
def get_pending_kyc(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all pending KYC documents (Admin only)"""
    
    if current_user.role not in [UserRole.admin, UserRole.support]:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    pending_docs = db.query(KYCDocument).filter(
        KYCDocument.status.in_([KYCStatus.pending, KYCStatus.under_review])
    ).order_by(KYCDocument.submitted_at.asc()).all()
    
    return {
        "pending_documents": [
            {
                "id": doc.id,
                "user_id": doc.user_id,
                "user_email": doc.user.email,
                "full_name": doc.full_name,
                "document_type": doc.document_type.value,
                "document_number": doc.document_number,
                "status": doc.status.value,
                "submitted_at": doc.submitted_at,
                "document_front_url": doc.document_front_url,
                "document_back_url": doc.document_back_url
            }
            for doc in pending_docs
        ]
    }

@router.post("/admin/verify/{kyc_id}")
def verify_kyc_document(
    kyc_id: int,
    verification: KYCVerification,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Verify or reject KYC document (Admin only)"""
    
    if current_user.role not in [UserRole.admin, UserRole.support]:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    kyc_document = db.query(KYCDocument).filter(KYCDocument.id == kyc_id).first()
    if not kyc_document:
        raise HTTPException(status_code=404, detail="KYC document not found")
    
    # Update KYC status
    if verification.action == "approved":
        kyc_document.status = KYCStatus.verified
        kyc_document.verification_date = datetime.utcnow()
        
        # Update user's KYC status
        user = db.query(User).filter(User.id == kyc_document.user_id).first()
        user.kyc_status = "verified"
        
    elif verification.action == "rejected":
        kyc_document.status = KYCStatus.rejected
        kyc_document.rejection_reason = verification.comments
        
    elif verification.action == "requested_changes":
        kyc_document.status = KYCStatus.under_review
    
    kyc_document.verified_by = current_user.id
    
    # Log the verification action
    verification_log = KYCVerificationLog(
        kyc_document_id=kyc_id,
        admin_id=current_user.id,
        action=verification.action,
        comments=verification.comments
    )
    
    db.add(verification_log)
    db.commit()
    
    return {
        "message": f"KYC document {verification.action} successfully",
        "kyc_id": kyc_id,
        "new_status": kyc_document.status.value
    }

@router.get("/admin/statistics")
def get_kyc_statistics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get KYC verification statistics (Admin only)"""
    
    if current_user.role not in [UserRole.admin, UserRole.auditor]:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    total_submissions = db.query(KYCDocument).count()
    pending = db.query(KYCDocument).filter(KYCDocument.status == KYCStatus.pending).count()
    under_review = db.query(KYCDocument).filter(KYCDocument.status == KYCStatus.under_review).count()
    verified = db.query(KYCDocument).filter(KYCDocument.status == KYCStatus.verified).count()
    rejected = db.query(KYCDocument).filter(KYCDocument.status == KYCStatus.rejected).count()
    
    return {
        "total_submissions": total_submissions,
        "pending": pending,
        "under_review": under_review,
        "verified": verified,
        "rejected": rejected,
        "verification_rate": (verified / total_submissions * 100) if total_submissions > 0 else 0
    }