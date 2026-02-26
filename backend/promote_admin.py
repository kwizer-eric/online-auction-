import sys
import uuid
from sqlalchemy.orm import Session
from database.database import SessionLocal
from database import models

def promote_user(email):
    db: Session = SessionLocal()
    try:
        user = db.query(models.User).filter(models.User.email == email).first()
        if not user:
            print(f"Error: User with email '{email}' not found.")
            return False
        
        user.role = "admin"
        db.commit()
        print(f"Success: User '{user.name}' ({email}) has been promoted to admin.")
        return True
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
        return False
    finally:
        db.close()

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python promote_admin.py <email>")
        sys.exit(1)
    
    email = sys.argv[1]
    promote_user(email)
