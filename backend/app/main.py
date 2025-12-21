from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base
from app.auth.router import router as auth_router
from app.accounts.router import router as accounts_router
from app.transactions.router import router as transactions_router
from app.budgets.router import router as budgets_router
from app.users.router import router as users_router
from app.bills.router import router as bills_router
from app.rewards.router import router as rewards_router

# Create tables - wrapped in try/except to handle database connection issues
try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"Warning: Could not create database tables: {e}")
    print("Make sure PostgreSQL is running with correct credentials")

app = FastAPI(
    title="Modern Digital Banking Dashboard",
    description="Unified personal banking hub",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router, prefix="/api/auth", tags=["auth"])
app.include_router(accounts_router, prefix="/api/accounts", tags=["accounts"])
app.include_router(transactions_router, prefix="/api/transactions", tags=["transactions"])
app.include_router(budgets_router, prefix="/api/budgets", tags=["budgets"])
app.include_router(users_router, prefix="/api/user", tags=["user"])
app.include_router(bills_router, prefix="/api/bills", tags=["bills"])
app.include_router(rewards_router, prefix="/api/rewards", tags=["rewards"])

@app.get("/")
def read_root():
    return {"message": "Modern Digital Banking Dashboard API", "version": "1.0.0"}

@app.get("/health")
def health_check():
    return {"status": "ok"}


# Startup migration: ensure `users.role` exists. Safe to run repeatedly.
@app.on_event("startup")
def ensure_role_column():
    from sqlalchemy import text
    from sqlalchemy.exc import SQLAlchemyError
    from app.database import engine

    check_sql = text("SELECT column_name FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'role'")
    alter_sql = text("ALTER TABLE users ADD COLUMN role VARCHAR(50) NOT NULL DEFAULT 'user';")

    try:
        with engine.connect() as conn:
            r = conn.execute(check_sql)
            exists = r.fetchone() is not None
            if exists:
                print('Role column exists — no migration needed')
            else:
                print('Role column missing — applying migration...')
                conn.execute(alter_sql)
                try:
                    conn.commit()
                except Exception:
                    pass
                print('✅ Role column migration completed')
    except SQLAlchemyError as e:
        print('Warning: could not run role-column migration on startup:', e)
    except Exception as e:
        print('Unexpected error during startup migration:', e)


@app.post("/admin/fix-db")
async def fix_db():
    """Temporary endpoint to fix role column - DELETE AFTER USE"""
    from sqlalchemy import text
    from sqlalchemy.exc import SQLAlchemyError
    from app.database import engine

    try:
        with engine.connect() as conn:
            # Use IF NOT EXISTS logic via information_schema check to avoid errors
            r = conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'role'"))
            exists = r.fetchone() is not None
            if exists:
                return {"status": "Role column fixed"}

            conn.execute(text("ALTER TABLE users ADD COLUMN role VARCHAR(50) NOT NULL DEFAULT 'user';"))
            try:
                conn.commit()
            except Exception:
                pass
            print('✅ Role column migration completed via /admin/fix-db')
            return {"status": "Role column fixed"}
    except SQLAlchemyError as e:
        print('Error running /admin/fix-db:', e)
        return {"error": str(e)}
    except Exception as e:
        print('Unexpected error running /admin/fix-db:', e)
        return {"error": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
