import fastapi
from fastapi import Depends
import os
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
from app.notifications.router import router as notifications_router
from app.notifications import scheduler as notifications_scheduler
from app.dependencies import require_admin_only
from app.models.user import User

# Create tables - wrapped in try/except to handle database connection issues
try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"Warning: Could not create database tables: {e}")
    print("Make sure PostgreSQL is running with correct credentials")

app = fastapi.FastAPI(
    title="Modern Digital Banking Dashboard",
    description="Unified personal banking hub",
    version="1.0.0"
)

# CORS middleware
# Apply CORS middleware. Use configured origins when provided; fall back to permissive
# wildcard during development to avoid Swagger "Failed to fetch" errors caused by
# origin mismatches. In production you should lock this down to your frontend host.

# Use CORS origins from settings so deploy-time env var can control allowed origins.
# Be robust: `CORS_ORIGINS` may be a list (from Settings), or a string from env (JSON or comma-separated).
raw_cors = getattr(settings, "CORS_ORIGINS", None)
if isinstance(raw_cors, str):
    try:
        import json

        parsed = json.loads(raw_cors)
        origins = list(parsed) if isinstance(parsed, (list, tuple)) else [str(parsed)]
    except Exception:
        origins = [s.strip() for s in raw_cors.split(",") if s.strip()]
elif isinstance(raw_cors, (list, tuple)):
    origins = list(raw_cors)
else:
    origins = []

# Ensure deployed frontend origins used during demo are included (no-ops if already present).

# Ensure deployed frontend origins used during demo are included (no-ops if already present).
extra_prod_origins = [
    "https://modern-digital-banking-dashboard-pe-lemon.vercel.app",
    "https://modern-digital-banking-dashboard-personal-so6b-6n6w2uhz5.vercel.app",
]
for o in extra_prod_origins:
    if o not in origins:
        origins.append(o)

# If no origins configured, allow a permissive fallback for local development.
# In production you should set `CORS_ORIGINS` to your frontend host(s).
use_origin_regex = False
if not origins:
    env = os.getenv("ENV", os.getenv("PY_ENV", "development")).lower()
    if env in ("dev", "development", "local") or os.getenv("DEBUG", "0") == "1":
        use_origin_regex = True

print("CORS origins:", origins, "use_origin_regex:", use_origin_regex)

# Allow common Vercel preview domains via regex when appropriate (keeps credentials support).
# Enable via either presence of a vercel origin in `origins` or by setting `ALLOW_VERCEL_PREVIEWS=1`.
vercel_allowed = any("vercel.app" in (o or "") for o in origins) or os.getenv("ALLOW_VERCEL_PREVIEWS", "0") == "1"
vercel_regex = r"^https?://([a-zA-Z0-9-]+\.)?vercel\.app$"
if vercel_allowed:
    print("Vercel previews allowed via origin regex:", vercel_regex)

mw_kwargs = dict(
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
if use_origin_regex:
    # Allow any origin (development only) while still supporting credentials.
    mw_kwargs["allow_origins"] = []
    mw_kwargs["allow_origin_regex"] = ".*"
else:
    mw_kwargs["allow_origins"] = origins
    # If configured to allow Vercel previews, add a targeted regex in addition
    # to the explicit origins list so dynamic preview URLs work.
    if vercel_allowed:
        mw_kwargs["allow_origin_regex"] = vercel_regex

app.add_middleware(CORSMiddleware, **mw_kwargs)
# Include routers
app.include_router(auth_router, prefix="/api/auth", tags=["auth"])
app.include_router(accounts_router, prefix="/api/accounts", tags=["accounts"])
app.include_router(transactions_router, prefix="/api/transactions", tags=["transactions"])
app.include_router(budgets_router, prefix="/api/budgets", tags=["budgets"])
app.include_router(users_router, prefix="/api/user", tags=["user"])
app.include_router(bills_router, prefix="/api/bills", tags=["bills"])
app.include_router(rewards_router, prefix="/api/rewards", tags=["rewards"])
app.include_router(notifications_router, prefix="/api/notifications", tags=["notifications"])


@app.on_event("startup")
def start_notifications_scheduler():
    try:
        # start background scheduler (runs daily by default)
        notifications_scheduler.start_scheduler()
    except Exception as e:
        print("Warning: could not start notifications scheduler:", e)

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


@app.on_event("startup")
def promote_render_test_to_admin():
    """If a user with email `render.test@example.com` exists, make them an admin.

    This is a safe no-op if the user is not present; it helps automated deployments
    where you want a default admin user to exist for testing.
    """
    try:
        from app.database import SessionLocal
        from app.models.user import User

        db = SessionLocal()
        target_email = "render.test@example.com"
        user = db.query(User).filter(User.email == target_email).first()
        if user:
            if getattr(user, "role", None) != "admin":
                user.role = "admin"
                db.add(user)
                db.commit()
                print(f"Promoted {target_email} to admin on startup")
            else:
                print(f"{target_email} already admin")
        else:
            print(f"No user with email {target_email} found on startup — skipping admin promotion")
    except Exception as e:
        # Don't fail app startup if DB isn't available yet
        print("Warning: could not promote render.test@example.com to admin on startup:", e)


@app.post("/admin/fix-db")
async def fix_db(current_user: User = Depends(require_admin_only)):
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
