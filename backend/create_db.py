import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

def create_database():
    # Try common passwords or no password
    passwords = ['postgres', '', 'password']
    for pwd in passwords:
        try:
            conn = psycopg2.connect(
                dbname='postgres',
                user='postgres',
                password=pwd,
                host='localhost'
            )
            conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
            cur = conn.cursor()
            
            # Check if database exists
            cur.execute("SELECT 1 FROM pg_database WHERE datname='auction_db'")
            exists = cur.fetchone()
            if not exists:
                cur.execute('CREATE DATABASE auction_db')
                print("Database 'auction_db' created successfully.")
            else:
                print("Database 'auction_db' already exists.")
            
            cur.close()
            conn.close()
            return True
        except Exception as e:
            print(f"Failed with password '{pwd}': {e}")
    return False

if __name__ == "__main__":
    if create_database():
        print("Done.")
    else:
        print("Could not create database. Please ensure PostgreSQL is running and the password for 'postgres' user is correct.")
