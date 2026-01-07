import sys
import os

# Allow Alembic to find `app`
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from logging.config import fileConfig
from sqlalchemy import create_engine
from alembic import context

from app.database import Base
from app.config import settings

# Import models so Alembic can detect tables
from app.models.user import User
from app.models.account import Account
from app.models.transaction import Transaction
from app.models.alert import Alert
from app.models.bill import Bill
from app.models.reward import Reward
from app.models.user_device import UserDevice
from app.models.user_settings import UserSettings
from app.models.otp import OTP
from app.models.admin_rewards import AdminReward
from app.models.audit_log import AuditLog
from app.budgets.models import Budget


# Alembic Config
config = context.config

# Logging
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Metadata for autogenerate
target_metadata = Base.metadata


def run_migrations_online():
    engine = create_engine(
        settings.DATABASE_URL,
        pool_pre_ping=True
    )

    with engine.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
        )

        with context.begin_transaction():
            context.run_migrations()


# ❌ Do NOT support offline mode
run_migrations_online()
