import models, database
from database import engine
from sqlalchemy import text

def add_is_active_column_to_responses():
    print("Checking for is_active column in form_responses...")
    with engine.connect() as conn:
        try:
            # Check if column exists
            result = conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name='form_responses' AND column_name='is_active'"))
            if not result.fetchone():
                print("Adding is_active column...")
                conn.execute(text("ALTER TABLE form_responses ADD COLUMN is_active BOOLEAN DEFAULT TRUE"))
                conn.commit()
                print("Column added successfully!")
            else:
                print("Column already exists.")
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    add_is_active_column_to_responses()
