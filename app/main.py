from fastapi import FastAPI
from app.database import Base, engine
from app.auth.router import router as auth_router
from fastapi.middleware.cors import CORSMiddleware

# create DB tables (dev)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Modern Digital Banking Dashboard API")

# include auth router (this registers /auth/* endpoints)
app.include_router(auth_router)

@app.get("/")
def root():
    return {"message": "Banking API Running"}

origins = ["http://localhost:5173", "http://localhost:3000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
