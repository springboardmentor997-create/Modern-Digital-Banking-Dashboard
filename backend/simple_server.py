from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import uvicorn
import sqlite3
import hashlib
import jwt
from datetime import datetime, timedelta
import os

app = FastAPI(title="Banking System API", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# JWT Configuration
SECRET_KEY = "your-secret-key-here"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440

# Database setup
def init_db():
    conn = sqlite3.connect('banking_app.db')
    cursor = conn.cursor()
    
    # Create users table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            name TEXT,
            role TEXT DEFAULT 'user',
            is_active BOOLEAN DEFAULT 1,
            kyc_status TEXT DEFAULT 'unverified',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Create KYC documents table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS kyc_documents (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            full_name TEXT,
            date_of_birth TEXT,
            address TEXT,
            phone TEXT,
            document_type TEXT,
            document_number TEXT,
            document_front_url TEXT,
            document_back_url TEXT,
            status TEXT DEFAULT 'pending',
            submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            verification_date TIMESTAMP,
            rejection_reason TEXT,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    # Insert default users if they don't exist
    cursor.execute("SELECT COUNT(*) FROM users WHERE email = ?", ("admin@bank.com",))
    if cursor.fetchone()[0] == 0:
        admin_password = hashlib.sha256("admin123".encode()).hexdigest()
        cursor.execute('''
            INSERT INTO users (email, password, name, role, kyc_status)
            VALUES (?, ?, ?, ?, ?)
        ''', ("admin@bank.com", admin_password, "Admin User", "admin", "verified"))
    
    cursor.execute("SELECT COUNT(*) FROM users WHERE email = ?", ("user@bank.com",))
    if cursor.fetchone()[0] == 0:
        user_password = hashlib.sha256("user123".encode()).hexdigest()
        cursor.execute('''
            INSERT INTO users (email, password, name, role, kyc_status)
            VALUES (?, ?, ?, ?, ?)
        ''', ("user@bank.com", user_password, "Regular User", "user", "verified"))
    
    cursor.execute("SELECT COUNT(*) FROM users WHERE email = ?", ("test@test.com",))
    if cursor.fetchone()[0] == 0:
        test_password = hashlib.sha256("test123".encode()).hexdigest()
        cursor.execute('''
            INSERT INTO users (email, password, name, role, kyc_status)
            VALUES (?, ?, ?, ?, ?)
        ''', ("test@test.com", test_password, "Test User", "user", "verified"))
    
    conn.commit()
    conn.close()

# Initialize database on startup
init_db()

# Pydantic models
class LoginRequest(BaseModel):
    email: str
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user: dict

class KYCSubmission(BaseModel):
    full_name: str
    date_of_birth: str
    address: str
    phone: str
    document_type: str
    document_number: str

# Helper functions
def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return hash_password(plain_password) == hashed_password

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_user_by_email(email: str):
    conn = sqlite3.connect('banking_app.db')
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
    user = cursor.fetchone()
    conn.close()
    if user:
        return {
            "id": user[0],
            "email": user[1],
            "password": user[2],
            "name": user[3],
            "role": user[4],
            "is_active": user[5],
            "kyc_status": user[6],
            "created_at": user[7]
        }
    return None

# Routes
@app.get("/")
def read_root():
    return {"message": "Banking System API is running", "status": "healthy", "version": "1.0.0"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat(), "database": "connected"}

@app.get("/api/health")
def api_health_check():
    return {"status": "healthy", "api_version": "1.0.0", "endpoints": "active"}

@app.post("/api/auth/login", response_model=LoginResponse)
def login(login_request: LoginRequest):
    user = get_user_by_email(login_request.email)
    
    if not user or not verify_password(login_request.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    if not user["is_active"]:
        raise HTTPException(status_code=401, detail="Account is inactive")
    
    access_token = create_access_token(data={"sub": user["email"], "user_id": user["id"]})
    
    return LoginResponse(
        access_token=access_token,
        token_type="bearer",
        user={
            "id": user["id"],
            "email": user["email"],
            "name": user["name"],
            "role": user["role"],
            "kyc_status": user["kyc_status"]
        }
    )

@app.post("/api/kyc/submit")
def submit_kyc(kyc_data: KYCSubmission):
    # Simple KYC submission endpoint
    conn = sqlite3.connect('banking_app.db')
    cursor = conn.cursor()
    
    cursor.execute('''
        INSERT INTO kyc_documents (user_id, full_name, date_of_birth, address, phone, document_type, document_number)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', (1, kyc_data.full_name, kyc_data.date_of_birth, kyc_data.address, 
          kyc_data.phone, kyc_data.document_type, kyc_data.document_number))
    
    conn.commit()
    conn.close()
    
    return {"message": "KYC documents submitted successfully", "status": "pending"}

@app.get("/api/kyc/status")
def get_kyc_status():
    return {
        "kyc_status": "verified",
        "message": "KYC verification completed"
    }

# Dashboard endpoints
@app.get("/api/dashboard/stats")
def get_dashboard_stats():
    return {
        "total_balance": 25000.00,
        "monthly_income": 5000.00,
        "monthly_expenses": 3500.00,
        "savings_rate": 30.0
    }

@app.get("/api/accounts")
def get_accounts():
    return {
        "accounts": [
            {
                "id": 1,
                "account_number": "1234567890",
                "account_type": "savings",
                "balance": 25000.00,
                "currency": "USD"
            }
        ]
    }

@app.get("/api/transactions")
def get_transactions():
    return {
        "transactions": [
            {
                "id": 1,
                "amount": -50.00,
                "description": "Coffee Shop",
                "date": "2024-01-15",
                "type": "debit"
            },
            {
                "id": 2,
                "amount": 1000.00,
                "description": "Salary",
                "date": "2024-01-01",
                "type": "credit"
            }
        ]
    }

if __name__ == "__main__":
    uvicorn.run("simple_server:app", host="127.0.0.1", port=8000, reload=True)