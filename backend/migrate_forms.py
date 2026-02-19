from sqlalchemy import create_engine, text
from database import SQLALCHEMY_DATABASE_URL

def migrate_forms():
    engine = create_engine(SQLALCHEMY_DATABASE_URL)
    with engine.connect() as conn:
        print("Checking forms table...")
        # Check if column 'schema' exists
        check_query = text("SELECT column_name FROM information_schema.columns WHERE table_name='forms' AND column_name='schema'")
        result = conn.execute(check_query)
        
        if result.fetchone():
            print("Renaming 'schema' column to 'form_schema' in forms table...")
            conn.execute(text("ALTER TABLE forms RENAME COLUMN schema TO form_schema"))
            conn.commit()
            print("Completed!")
        else:
            print("Column 'schema' not found or already renamed.")

if __name__ == "__main__":
    migrate_forms()
