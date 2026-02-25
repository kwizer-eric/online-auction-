
import sys
import os
from sqlalchemy.orm import Session
from dotenv import load_dotenv

# Add the backend directory to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 'backend')))

# Load .env file
load_dotenv(os.path.join(os.path.dirname(__file__), 'backend', '.env'))

from backend.database.database import SessionLocal
from backend.database import models

def promote_user(email):
    db = SessionLocal()
    try:
        user = db.query(models.User).filter(models.User.email == email).first()
        if not user:
            print(f"Error: User with email '{email}' not found.")
            return
        
        user.role = 'admin'
        db.commit()
        print(f"Success: User '{user.name}' ({email}) has been promoted to admin.")
        print("You can now access /admin routes with this account.")
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python promote_admin.py <email>")
    else:
        promote_user(sys.argv[1])
