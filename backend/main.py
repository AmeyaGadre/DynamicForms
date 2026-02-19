from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import models, schemas, auth, database
from database import engine

# Tables are created via init_db.py manual step
# models.Base.metadata.create_all(bind=engine)


app = FastAPI(title="Dynamic Forms Backend")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://dynamic-forms-ameyag-b7cd6.web.app",
        "https://dynamic-forms-ameyag-b7cd6.firebaseapp.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.post("/api/signup", response_model=schemas.User)

def signup(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    db_user = db.query(models.User).filter(models.User.mobile_number == user.mobile_number).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Mobile number already registered")
    
    # First user is admin (for demo purposes)
    is_admin = db.query(models.User).count() == 0
    
    hashed_password = auth.get_password_hash(user.password)
    new_user = models.User(
        mobile_number=user.mobile_number, 
        password_hash=hashed_password,
        is_admin=is_admin
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.post("/api/login", response_model=schemas.Token)
def login(user_data: schemas.UserCreate, db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.mobile_number == user_data.mobile_number).first()
    if not user or not auth.verify_password(user_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect mobile number or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(status_code=401, detail="Account deactivated")
        
    access_token = auth.create_access_token(data={"sub": user.mobile_number})
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/api/me", response_model=schemas.User)
def get_me(current_user: models.User = Depends(auth.get_current_user)):
    return current_user

@app.put("/api/profile", response_model=schemas.User)
def update_profile(
    profile_data: schemas.UserUpdateProfile,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    if profile_data.first_name:
        current_user.first_name = profile_data.first_name
    if profile_data.last_name:
        current_user.last_name = profile_data.last_name
    
    db.commit()
    db.refresh(current_user)
    return current_user


@app.get("/api/admin/users", response_model=List[schemas.User])
def get_all_users(
    admin_user: models.User = Depends(auth.get_admin_user), 
    db: Session = Depends(database.get_db)
):
    return db.query(models.User).all()

@app.put("/api/admin/users/{user_id}/toggle-status", response_model=schemas.User)
def toggle_user_status(
    user_id: int, 
    admin_user: models.User = Depends(auth.get_admin_user), 
    db: Session = Depends(database.get_db)
):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user.id == admin_user.id:
        raise HTTPException(status_code=400, detail="Cannot deactivate yourself")

    user.is_active = not user.is_active
    db.commit()
    db.refresh(user)
    return user

# Dynamic Forms APIs
@app.post("/api/forms", response_model=schemas.Form)
def create_form(
    form: schemas.FormCreate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    db_form = models.Form(
        title=form.title,
        description=form.description,
        form_schema=form.form_schema,
        created_by=current_user.id
    )


    db.add(db_form)
    db.commit()
    db.refresh(db_form)
    return db_form

@app.get("/api/forms", response_model=List[schemas.Form])
def get_forms(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    return db.query(models.Form).filter(models.Form.created_by == current_user.id).all()

@app.get("/api/forms/{form_id}", response_model=schemas.Form)
def get_form(
    form_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    form = db.query(models.Form).filter(models.Form.id == form_id).first()
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")
    
    # Allow access if user is creator OR has been granted access
    if form.created_by != current_user.id:
        access = db.query(models.FormAccess).filter(
            models.FormAccess.form_id == form_id,
            models.FormAccess.user_id == current_user.id,
            models.FormAccess.has_access == True
        ).first()
        if not access:
            raise HTTPException(status_code=403, detail="Forbidden: You do not have access to this form")
            
    return form


@app.put("/api/forms/{form_id}", response_model=schemas.Form)
def update_form(
    form_id: int,
    form_update: schemas.FormCreate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    db_form = db.query(models.Form).filter(models.Form.id == form_id, models.Form.created_by == current_user.id).first()
    if not db_form:
        raise HTTPException(status_code=404, detail="Form not found")
    
    db_form.title = form_update.title
    db_form.description = form_update.description
    db_form.form_schema = form_update.form_schema

    
    db.commit()
    db.refresh(db_form)
    return db_form

# Form Access Management (Admin)
@app.get("/api/admin/forms/{form_id}/access", response_model=List[schemas.UserAccessInfo])
def get_form_access(
    form_id: int,
    admin_user: models.User = Depends(auth.get_admin_user),
    db: Session = Depends(database.get_db)
):
    users = db.query(models.User).filter(models.User.is_admin == False).all()
    access_records = db.query(models.FormAccess).filter(models.FormAccess.form_id == form_id).all()
    access_map = {a.user_id: a.has_access for a in access_records}
    
    return [
        schemas.UserAccessInfo(
            user_id=u.id,
            mobile_number=u.mobile_number,
            first_name=u.first_name,
            last_name=u.last_name,
            has_access=access_map.get(u.id, False)
        ) for u in users
    ]

@app.put("/api/admin/forms/{form_id}/access")
def update_form_access(
    form_id: int,
    access_data: schemas.FormAccessUpdate,
    admin_user: models.User = Depends(auth.get_admin_user),
    db: Session = Depends(database.get_db)
):
    record = db.query(models.FormAccess).filter(
        models.FormAccess.form_id == form_id, 
        models.FormAccess.user_id == access_data.user_id
    ).first()
    
    if record:
        record.has_access = access_data.has_access
    else:
        new_record = models.FormAccess(
            form_id=form_id, 
            user_id=access_data.user_id, 
            has_access=access_data.has_access
        )
        db.add(new_record)
    
    db.commit()
    return {"message": "Access updated"}

# Shared Forms and Responses (Users)
@app.get("/api/user/shared-forms", response_model=List[schemas.Form])
def get_shared_forms(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    shared_ids = db.query(models.FormAccess.form_id).filter(
        models.FormAccess.user_id == current_user.id,
        models.FormAccess.has_access == True
    ).all()
    form_ids = [s[0] for s in shared_ids]
    return db.query(models.Form).filter(models.Form.id.in_(form_ids)).all()

@app.post("/api/forms/{form_id}/responses", response_model=schemas.FormResponse)
def submit_response(
    form_id: int,
    response: schemas.FormResponseCreate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    # Verify access
    access = db.query(models.FormAccess).filter(
        models.FormAccess.form_id == form_id,
        models.FormAccess.user_id == current_user.id,
        models.FormAccess.has_access == True
    ).first()
    
    if not access:
        raise HTTPException(status_code=403, detail="No access to this form")
        
    new_response = models.FormResponse(
        form_id=form_id,
        user_id=current_user.id,
        response_data=response.response_data
    )
    db.add(new_response)
    db.commit()
    db.refresh(new_response)
    return new_response

@app.get("/api/forms/{form_id}/responses", response_model=List[schemas.FormResponse])
def get_user_responses(
    form_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    return db.query(models.FormResponse).filter(
        models.FormResponse.form_id == form_id,
        models.FormResponse.user_id == current_user.id
    ).all()

@app.put("/api/responses/{response_id}", response_model=schemas.FormResponse)
def update_response(
    response_id: int,
    response_update: schemas.FormResponseUpdate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    db_response = db.query(models.FormResponse).filter(
        models.FormResponse.id == response_id,
        models.FormResponse.user_id == current_user.id
    ).first()
    
    if not db_response:
        raise HTTPException(status_code=404, detail="Response record not found")
        
    if response_update.response_data is not None:
        db_response.response_data = response_update.response_data
    if response_update.is_active is not None:
        db_response.is_active = response_update.is_active
        
    db.commit()
    db.refresh(db_response)
    return db_response



