#!/usr/bin/env python3
"""
Quick start script for the banking backend API
"""
import os
import sys
import uvicorn
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

def main():
    print("🚀 Starting Banking Backend API...")
    print(f"📁 Backend directory: {backend_dir}")
    
    # Set environment variables if not set
    os.environ.setdefault("DATABASE_URL", "postgresql://postgres:Urmila@localhost:5433/banking_db")
    
    try:
        # Import and run the FastAPI app
        uvicorn.run(
            "app.main:app",
            host="127.0.0.1",
            port=8000,
            reload=True,
            log_level="info"
        )
    except Exception as e:
        print(f"❌ Failed to start server: {e}")
        print("💡 Make sure PostgreSQL is running on port 5433")
        print("💡 Database: banking_db, User: postgres, Password: Urmila")
        sys.exit(1)

if __name__ == "__main__":
    main()