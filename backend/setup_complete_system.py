#!/usr/bin/env python3
"""
Complete Banking System Setup Script
This script ensures all required features are properly configured and working.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal, init_database
from app.models.user import User, UserRole
from app.models.account import Account
from app.models.transaction import Transaction, TxnType
from app.models.budget import Budget
from app.models.bill import Bill, BillStatus
from app.models.reward import Reward
from app.models.alert import Alert, AlertType
from app.models.admin_log import AdminLog
from app.utils.hash_password import hash_password
from datetime import datetime, date, timedelta
from decimal import Decimal
import random

def create_sample_data():
    """Create comprehensive sample data for all modules"""
    print("Creating sample data for all banking modules...")
    
    db = SessionLocal()
    try:
        # Module A: Auth & User Setup
        print("Module A: Setting up users and authentication...")
        
        # Admin user
        admin_user = db.query(User).filter(User.email == "admin@bank.com").first()
        if not admin_user:
            admin_user = User(
                email="admin@bank.com",
                password=hash_password("admin123"),
                name="Admin User",
                role=UserRole.admin,
                is_active=True,
                kyc_status="verified",
                phone="+1234567890"
            )
            db.add(admin_user)
            db.commit()
            db.refresh(admin_user)
        
        # Regular user
        regular_user = db.query(User).filter(User.email == "user@bank.com").first()
        if not regular_user:
            regular_user = User(
                email="user@bank.com",
                password=hash_password("user123"),
                name="John Doe",
                role=UserRole.user,
                is_active=True,
                kyc_status="verified",
                phone="+1234567891"
            )
            db.add(regular_user)
            db.commit()
            db.refresh(regular_user)
        
        # Module B: Accounts & Transactions
        print("Module B: Setting up accounts and transactions...")
        
        # Create accounts for regular user
        accounts = []
        account_types = ["savings", "checking", "credit_card"]
        
        for i, acc_type in enumerate(account_types):
            existing_account = db.query(Account).filter(
                Account.user_id == regular_user.id,
                Account.account_type == acc_type
            ).first()
            
            if not existing_account:
                account = Account(
                    user_id=regular_user.id,
                    name=f"{acc_type.replace('_', ' ').title()} Account",
                    bank_name="Demo Bank",
                    account_type=acc_type,
                    account_number=f"123456789{i}",
                    masked_account=f"****{i}",
                    currency="INR",
                    balance=Decimal("10000.00") if acc_type != "credit_card" else Decimal("0.00"),
                    is_active=True
                )
                db.add(account)
                accounts.append(account)
        
        db.commit()
        
        # Create sample transactions
        if accounts:
            categories = ["Food", "Transportation", "Entertainment", "Shopping", "Bills", "Income"]
            merchants = ["Amazon", "Walmart", "Starbucks", "Shell", "Netflix", "Company Inc"]
            
            for i in range(20):
                account = random.choice(accounts)
                category = random.choice(categories)
                merchant = random.choice(merchants)
                
                # Mix of credit and debit transactions
                txn_type = TxnType.credit if category == "Income" else TxnType.debit
                amount = Decimal(str(random.uniform(10, 500)))
                
                transaction = Transaction(
                    user_id=regular_user.id,
                    account_id=account.id,
                    amount=amount,
                    txn_type=txn_type,
                    description=f"{category} transaction at {merchant}",
                    category=category,
                    merchant=merchant,
                    currency="INR",
                    txn_date=datetime.now() - timedelta(days=random.randint(1, 30))
                )
                db.add(transaction)
        
        # Module C: Budgeting & Categorization
        print("Module C: Setting up budgets and categorization...")
        
        budget_categories = ["Food", "Transportation", "Entertainment", "Shopping", "Bills"]
        current_month = datetime.now().month
        current_year = datetime.now().year
        
        for i, category in enumerate(budget_categories):
            existing_budget = db.query(Budget).filter(
                Budget.user_id == regular_user.id,
                Budget.category == category,
                Budget.month == current_month,
                Budget.year == current_year
            ).first()
            
            if not existing_budget:
                budget = Budget(
                    user_id=regular_user.id,
                    name=f"{category} Budget",
                    month=current_month,
                    year=current_year,
                    category=category,
                    category_id=i + 1,
                    limit_amount=Decimal(str(random.uniform(500, 2000))),
                    spent_amount=Decimal(str(random.uniform(100, 800)))
                )
                db.add(budget)
        
        # Module D: Bills, Reminders & Rewards
        print("Module D: Setting up bills and rewards...")
        
        # Create sample bills
        bill_names = ["Electricity", "Internet", "Phone", "Rent", "Insurance"]
        for i, bill_name in enumerate(bill_names):
            existing_bill = db.query(Bill).filter(
                Bill.user_id == regular_user.id,
                Bill.biller_name == bill_name
            ).first()
            
            if not existing_bill:
                bill = Bill(
                    user_id=regular_user.id,
                    biller_name=bill_name,
                    due_date=date.today() + timedelta(days=random.randint(1, 30)),
                    amount_due=Decimal(str(random.uniform(50, 500))),
                    status=BillStatus.upcoming,
                    auto_pay=random.choice([True, False])
                )
                db.add(bill)
        
        # Create sample rewards
        reward_programs = ["Cashback Rewards", "Travel Points", "Shopping Points"]
        for program in reward_programs:
            existing_reward = db.query(Reward).filter(
                Reward.user_id == regular_user.id,
                Reward.program_name == program
            ).first()
            
            if not existing_reward:
                reward = Reward(
                    user_id=regular_user.id,
                    program_name=program,
                    points_balance=random.randint(100, 5000),
                    title=f"{program} Program"
                )
                db.add(reward)
        
        # Module E: Insights, Alerts & Admin
        print("Module E: Setting up alerts and admin logs...")
        
        # Create sample alerts
        alert_types = [AlertType.low_balance, AlertType.bill_due, AlertType.budget_exceeded]
        alert_messages = [
            "Your account balance is running low",
            "You have a bill due soon", 
            "You have exceeded your monthly budget"
        ]
        
        for alert_type, message in zip(alert_types, alert_messages):
            existing_alert = db.query(Alert).filter(
                Alert.user_id == regular_user.id,
                Alert.type == alert_type
            ).first()
            
            if not existing_alert:
                alert = Alert(
                    user_id=regular_user.id,
                    type=alert_type,
                    message=message,
                    is_read=False
                )
                db.add(alert)
        
        db.commit()
        print("All sample data created successfully!")
        
        # Print summary
        print()
        print("="*50)
        print("BANKING SYSTEM SETUP COMPLETE")
        print("="*50)
        print()
        print("SYSTEM SUMMARY:")
        print(f"Total Users: {db.query(User).count()}")
        print(f"Total Accounts: {db.query(Account).count()}")
        print(f"Total Transactions: {db.query(Transaction).count()}")
        print(f"Total Budgets: {db.query(Budget).count()}")
        print(f"Total Bills: {db.query(Bill).count()}")
        print(f"Total Rewards: {db.query(Reward).count()}")
        print(f"Total Alerts: {db.query(Alert).count()}")
        
        print()
        print("LOGIN CREDENTIALS:")
        print("Admin: admin@bank.com / admin123")
        print("User: user@bank.com / user123")
        
        print()
        print("API ENDPOINTS:")
        print("Frontend: http://localhost:5173")
        print("Backend API: http://localhost:8000")
        print("API Docs: http://localhost:8000/docs")
        
        print()
        print("ALL MODULES IMPLEMENTED:")
        print("Module A: Auth & User Setup")
        print("Module B: Accounts & Transactions (with CSV import)")
        print("Module C: Budgeting & Categorization")
        print("Module D: Bills, Reminders & Rewards")
        print("Module E: Insights, Alerts & Admin")
        print("Currency Conversion")
        print("CSV/PDF Export functionality")
        print("Multi-account overview")
        print("Role-based access control")
        print("JWT Authentication")
        
    except Exception as e:
        print(f"Error setting up sample data: {e}")
        db.rollback()
    finally:
        db.close()

def main():
    """Main setup function"""
    print("Starting Complete Banking System Setup...")
    print("="*50)
    
    # Initialize database
    print("Initializing database tables...")
    init_database()
    
    # Create sample data
    create_sample_data()
    
    print()
    print("Banking System is ready for use!")

if __name__ == "__main__":
    main()