import sys
from app.database import SessionLocal, init_database
from app.models.user import User, UserRole
from app.utils.hash_password import hash_password

def fix_database():
    print("🔧 Fixing database...")
    
    try:
        init_database()
        print("✅ Database tables created")
    except Exception as e:
        print(f"⚠️ Database init warning: {e}")
    
    db = SessionLocal()
    try:
        # Check existing users
        users = db.query(User).all()
        print(f"\n📊 Found {len(users)} users in database")
        
        # Create test user if not exists
        test_user = db.query(User).filter(User.email == "test@test.com").first()
        if not test_user:
            test_user = User(
                email="test@test.com",
                password=hash_password("test123"),
                name="Test User",
                role=UserRole.user,
                is_active=True,
                kyc_status="verified"
            )
            db.add(test_user)
            db.commit()
            print("✅ Created test@test.com / test123")
        else:
            # Update password to ensure it works
            test_user.password = hash_password("test123")
            test_user.is_active = True
            db.commit()
            print("✅ Updated test@test.com / test123")
        
        # Create admin if not exists
        admin = db.query(User).filter(User.email == "admin@bank.com").first()
        if not admin:
            admin = User(
                email="admin@bank.com",
                password=hash_password("admin123"),
                name="Admin User",
                role=UserRole.admin,
                is_active=True,
                kyc_status="verified"
            )
            db.add(admin)
            db.commit()
            print("✅ Created admin@bank.com / admin123")
        else:
            admin.password = hash_password("admin123")
            admin.is_active = True
            db.commit()
            print("✅ Updated admin@bank.com / admin123")
        
        print("\n✅ Database fixed successfully!")
        print("\n🔐 Login credentials:")
        print("   - test@test.com / test123")
        print("   - admin@bank.com / admin123")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
        sys.exit(1)
    finally:
        db.close()

if __name__ == "__main__":
    fix_database()
