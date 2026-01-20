import sys
from app.database import SessionLocal, init_database
from app.models.user import User, UserRole
from app.utils.hash_password import hash_password

def fix_database():
    print("Fixing database...")
    
    from app.database import engine, Base
    from sqlalchemy import text
    
    # Force recreate tables if needed
    try:
        with engine.begin() as conn:
            print("Dropping all tables to ensure schema sync...")
            # Drop tables in correct order or use CASCADE
            conn.execute(text("DROP TABLE IF EXISTS users CASCADE"))
            conn.execute(text("DROP TABLE IF EXISTS accounts CASCADE"))
            conn.execute(text("DROP TABLE IF EXISTS transactions CASCADE"))
            conn.execute(text("DROP TABLE IF EXISTS alerts CASCADE"))
            conn.execute(text("DROP TABLE IF EXISTS budgets CASCADE"))
            conn.execute(text("DROP TABLE IF EXISTS bills CASCADE"))
            conn.execute(text("DROP TABLE IF EXISTS rewards CASCADE"))
            conn.execute(text("DROP TABLE IF EXISTS expenses CASCADE"))
            conn.execute(text("DROP TABLE IF EXISTS categories CASCADE"))
            conn.execute(text("DROP TABLE IF EXISTS admin_logs CASCADE"))
            print("Tables dropped successfully")
    except Exception as e:
        print(f"Warning during drop: {e}")

    try:
        Base.metadata.create_all(bind=engine)
        print("Database tables created")
    except Exception as e:
        print(f"Database init warning: {e}")
    
    db = SessionLocal()
    try:
        # Check existing users
        users = db.query(User).all()
        print(f"\nFound {len(users)} users in database")
        
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
            print("Created test@test.com / test123")
        else:
            # Update password to ensure it works
            test_user.password = hash_password("test123")
            test_user.is_active = True
            db.commit()
            print("Updated test@test.com / test123")
        
        # Create admin if not exists
        admin = db.query(User).filter(User.email == "admin@bank.com").first()
        if not admin:
            admin = User(
                email="admin@bank.com",
                password=hash_password("test123"),
                name="Admin User",
                role=UserRole.admin,
                is_active=True,
                kyc_status="verified"
            )
            db.add(admin)
            db.commit()
            print("Created admin@bank.com / test123")
        else:
            admin.password = hash_password("test123")
            admin.is_active = True
            db.commit()
            print("Updated admin@bank.com / test123")
        
        # Create regular user
        user = db.query(User).filter(User.email == "user@bank.com").first()
        if not user:
            user = User(
                email="user@bank.com",
                password=hash_password("test123"),
                name="Regular User",
                role=UserRole.user,
                is_active=True,
                kyc_status="verified"
            )
            db.add(user)
            db.commit()
            print("Created user@bank.com / test123")
        else:
            user.password = hash_password("test123")
            user.is_active = True
            db.commit()
            print("Updated user@bank.com / test123")
        
        print("\nDatabase fixed successfully!")
        print("\nLogin credentials (all passwords are 'test123'):")
        print("   - test@test.com")
        print("   - admin@bank.com")
        print("   - user@bank.com")
        
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
        sys.exit(1)
    finally:
        db.close()

if __name__ == "__main__":
    fix_database()
