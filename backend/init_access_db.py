import models, database
from database import engine

def init_new_tables():
    print("Initializing new tables: form_access, form_responses")
    models.Base.metadata.create_all(bind=engine)
    print("Done!")

if __name__ == "__main__":
    init_new_tables()
