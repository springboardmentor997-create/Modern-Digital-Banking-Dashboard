from app.database import Base
import warnings

# Some models (e.g., KYC) may not be present in minimal installs or may
# fail to import in reload subprocesses; import them defensively so the
# package import won't blow up the entire app startup.
try:
    from .kyc import KYCDocument, KYCVerificationLog, DocumentType
except Exception as e:
    warnings.warn(f"Could not import KYC models: {e}")
    KYCDocument = KYCVerificationLog = DocumentType = None

from .user import User, KYCStatus, UserRole
from .account import Account, AccountType
from .transaction import Transaction
from .budget import Budget
from .reward import Reward
from .alert import Alert
from .bill import Bill
from .expense import Expense
from .admin_log import AdminLog