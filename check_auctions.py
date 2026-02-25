
import sys
import os
from dotenv import load_dotenv

# Add the backend directory to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 'backend')))

# Load .env file
load_dotenv(os.path.join(os.path.dirname(__file__), 'backend', '.env'))

from backend.database.database import SessionLocal
from backend.database import models

def check_auctions():
    db = SessionLocal()
    try:
        auctions = db.query(models.Auction).all()
        print(f"Total auctions in database: {len(auctions)}")
        for a in auctions:
            print(f"- ID: {a.id}, Title: {a.title}, Status: {a.status}")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    check_auctions()
