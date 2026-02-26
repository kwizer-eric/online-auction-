
import sys
import os
from dotenv import load_dotenv

# Add the backend directory to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 'backend')))

# Load .env file
load_dotenv(os.path.join(os.path.dirname(__file__), 'backend', '.env'))

from backend.database.database import SessionLocal
from backend.database import models

def list_users():
    db = SessionLocal()
    try:
        users = db.query(models.User).all()
        print(f"--- USER LIST ({len(users)}) ---")
        for u in users:
            print(f"Email: {u.email}, Name: {u.name}, Role: {u.role}")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    list_users()
