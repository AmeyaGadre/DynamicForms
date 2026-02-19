from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    mobile_number = Column(String(10), unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    first_name = Column(String, nullable=True)
    last_name = Column(String, nullable=True)
    is_admin = Column(Boolean, default=False)

    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Form(Base):
    __tablename__ = "forms"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String)
    form_schema = Column(String)  # Stored as JSON string

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    created_by = Column(Integer, index=True)

class FormAccess(Base):
    __tablename__ = "form_access"
    id = Column(Integer, primary_key=True, index=True)
    form_id = Column(Integer, nullable=False)
    user_id = Column(Integer, nullable=False)
    has_access = Column(Boolean, default=True)

class FormResponse(Base):
    __tablename__ = "form_responses"
    id = Column(Integer, primary_key=True, index=True)
    form_id = Column(Integer, nullable=False)
    user_id = Column(Integer, nullable=False)
    response_data = Column(String)  # JSON string of submitted values
    is_active = Column(Boolean, default=True)
    submitted_at = Column(DateTime(timezone=True), server_default=func.now())


