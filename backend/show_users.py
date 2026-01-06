#!/usr/bin/env python3
"""Show all registered users and their login credentials"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal
from app.models.user import User

def show_all_users():
    """Display all registered users with their credentials"""
    print("=" * 60)
    print("BANKING SYSTEM - REGISTERED USERS")
    print("=" * 60)
    
    db = SessionLocal()
    try:
        users = db.query(User).all()
        
        if not users:
            print("No users found in database")
            return
        
        print(f"Total Users: {len(users)}")
        print()
        
        # Group users by role
        roles = {}
        for user in users:
            role = user.role.value if hasattr(user.role, 'value') else str(user.role)
            if role not in roles:
                roles[role] = []
            roles[role].append(user)
        
        # Display users by role
        for role, user_list in roles.items():
            print(f"{role.upper()} USERS:")
            print("-" * 30)
            for user in user_list:
                status = "Active" if user.is_active else "Inactive"
                kyc = user.kyc_status if hasattr(user, 'kyc_status') else "Unknown"
                print(f"Name: {user.name}")
                print(f"Email: {user.email}")
                print(f"Status: {status}")
                print(f"KYC: {kyc}")
                print()
        
        print("=" * 60)
        print("DEFAULT LOGIN CREDENTIALS:")
        print("=" * 60)
        print("Admin: admin@bank.com / admin123")
        print("User: user@bank.com / user123")
        print("Support: support@bank.com / support123")
        print("Auditor: auditor@bank.com / auditor123")
        print()
        print("Note: Other users can login with their registered passwords")
        print("=" * 60)
        
    except Exception as e:
        print(f"Error retrieving users: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    show_all_users()