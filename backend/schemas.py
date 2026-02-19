from pydantic import BaseModel, Field, validator
from datetime import datetime
from typing import Optional

class UserBase(BaseModel):
    mobile_number: str = Field(..., min_length=10, max_length=10, pattern="^[0-9]+$")

class UserCreate(UserBase):
    password: str = Field(..., min_length=4, max_length=4, pattern="^[0-9]+$")

class UserUpdate(BaseModel):
    is_active: Optional[bool] = None

class UserUpdateProfile(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None

class User(UserBase):
    id: int
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    is_admin: bool

    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    mobile_number: Optional[str] = None

class FormBase(BaseModel):
    title: str
    description: Optional[str] = None
    form_schema: str  # JSON string


class FormCreate(FormBase):
    pass

class Form(FormBase):
    id: int
    created_at: datetime
    created_by: int

    class Config:
        from_attributes = True

class FormAccessUpdate(BaseModel):
    user_id: int
    has_access: bool

class UserAccessInfo(BaseModel):
    user_id: int
    mobile_number: str
    first_name: Optional[str]
    last_name: Optional[str]
    has_access: bool

class FormResponseBase(BaseModel):
    form_id: int
    response_data: str # JSON string
    is_active: bool = True

class FormResponseCreate(FormResponseBase):
    pass

class FormResponseUpdate(BaseModel):
    response_data: Optional[str] = None
    is_active: Optional[bool] = None

class FormResponse(FormResponseBase):
    id: int
    user_id: int
    submitted_at: datetime


    class Config:
        from_attributes = True


