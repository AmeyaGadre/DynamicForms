from sqlalchemy import create_engine
from database import SQLALCHEMY_DATABASE_URL, Base
import models  # Import models to register them with Base

def init_db():
    print(f"Connecting to: {SQLALCHEMY_DATABASE_URL.split('@')[-1]}") # Log host for debug
    engine = create_engine(SQLALCHEMY_DATABASE_URL)
    
    print("Creating tables in the cloud database...")
    Base.metadata.create_all(bind=engine)
    print("Success! Database initialized.")

if __name__ == "__main__":
    init_db()
