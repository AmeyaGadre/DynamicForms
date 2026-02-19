from sqlalchemy import create_engine, text
from database import SQLALCHEMY_DATABASE_URL

def update_schema():
    engine = create_engine(SQLALCHEMY_DATABASE_URL)
    with engine.connect() as conn:
        print("Checking for new columns...")
        # Check if first_name exists
        check_query = text("SELECT column_name FROM information_schema.columns WHERE table_name='users' AND column_name='first_name'")
        result = conn.execute(check_query)
        
        if not result.fetchone():
            print("Adding first_name and last_name columns to users table...")
            # Execute directly on connection, SQLAlchemy logic handles transaction
            conn.execute(text("ALTER TABLE users ADD COLUMN first_name VARCHAR"))
            conn.execute(text("ALTER TABLE users ADD COLUMN last_name VARCHAR"))
            conn.commit()
            print("Columns added successfully!")
        else:
            print("Columns already exist.")

if __name__ == "__main__":
    update_schema()
