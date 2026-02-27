import re
from datetime import datetime
from typing import Dict, Tuple

class DocumentValidator:
    """Service for validating Indian identity documents"""
    
    @staticmethod
    def validate_aadhaar(aadhaar_number: str) -> Tuple[bool, str]:
        """Validate Aadhaar number format and checksum"""
        aadhaar = re.sub(r'[\s-]', '', aadhaar_number)
        
        if not re.match(r'^\d{12}$', aadhaar):
            return False, "Aadhaar must be exactly 12 digits"
        
        # Verhoeff algorithm validation
        def verhoeff_checksum(num_string):
            d = [
                [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
                [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
                [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
                [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
                [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
                [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
                [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
                [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
                [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
                [9, 8, 7, 6, 5, 4, 3, 2, 1, 0]
            ]
            
            p = [
                [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
                [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
                [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
                [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
                [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
                [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
                [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
                [7, 0, 4, 6, 9, 1, 3, 2, 5, 8]
            ]
            
            c = 0
            for i, digit in enumerate(reversed(num_string)):
                c = d[c][p[i % 8][int(digit)]]
            
            return c == 0
        
        if not verhoeff_checksum(aadhaar):
            return False, "Invalid Aadhaar checksum"
        
        return True, "Valid Aadhaar number"
    
    @staticmethod
    def validate_pan(pan_number: str) -> Tuple[bool, str]:
        """Validate PAN number format"""
        pan = pan_number.upper().strip()
        
        if not re.match(r'^[A-Z]{5}[0-9]{4}[A-Z]{1}$', pan):
            return False, "PAN format invalid. Should be ABCDE1234F"
        
        if pan[3] not in ['P', 'F', 'A', 'T', 'B', 'C', 'G', 'H', 'L', 'J']:
            return False, "Invalid PAN category"
        
        return True, "Valid PAN number"

class KYCVerificationService:
    """Complete KYC verification service"""
    
    def __init__(self):
        self.validator = DocumentValidator()
    
    def verify_document_number(self, document_type: str, document_number: str) -> Dict:
        """Verify document number based on type"""
        
        if document_type == 'aadhaar':
            is_valid, message = self.validator.validate_aadhaar(document_number)
        elif document_type == 'pan':
            is_valid, message = self.validator.validate_pan(document_number)
        else:
            is_valid, message = True, f"Basic validation for {document_type}"
        
        return {
            'valid': is_valid,
            'message': message,
            'document_type': document_type,
            'document_number': document_number
        }
    
    def perform_verification(self, kyc_data: Dict) -> Dict:
        """Perform complete KYC verification"""
        
        # Document validation
        doc_validation = self.verify_document_number(
            kyc_data['document_type'], 
            kyc_data['document_number']
        )
        
        # Personal info validation
        personal_valid = self._validate_personal_info(kyc_data)
        
        # Risk assessment
        risk_level = self._assess_risk(kyc_data)
        
        # Overall status
        if doc_validation['valid'] and personal_valid and risk_level == 'low':
            status = 'auto_approved'
        elif doc_validation['valid'] and personal_valid:
            status = 'manual_review'
        else:
            status = 'requires_correction'
        
        return {
            'overall_status': status,
            'document_validation': doc_validation,
            'personal_info_valid': personal_valid,
            'risk_level': risk_level
        }
    
    def _validate_personal_info(self, kyc_data: Dict) -> bool:
        """Validate personal information"""
        name = kyc_data.get('full_name', '')
        phone = kyc_data.get('phone', '')
        
        # Name validation
        if len(name.strip()) < 2 or not re.match(r'^[a-zA-Z\s.]+$', name):
            return False
        
        # Phone validation
        phone_clean = re.sub(r'[\s\-\+]', '', phone)
        if not re.match(r'^[6-9]\d{9}$', phone_clean):
            return False
        
        return True
    
    def _assess_risk(self, kyc_data: Dict) -> str:
        """Assess risk level"""
        risk_score = 0
        
        # Document type risk
        if kyc_data.get('document_type') in ['aadhaar', 'pan']:
            risk_score += 0
        else:
            risk_score += 1
        
        # Address risk
        address = kyc_data.get('address', '').lower()
        if any(term in address for term in ['temporary', 'temp', 'c/o']):
            risk_score += 1
        
        return 'low' if risk_score == 0 else 'medium' if risk_score == 1 else 'high'