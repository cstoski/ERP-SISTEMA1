from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional
from datetime import datetime


class UserBase(BaseModel):
    username: str
    email: EmailStr
    role: Optional[str] = "user"


class UserCreate(UserBase):
    password: str


class TokenRequest(BaseModel):
    username: str
    password: str


class UserRead(UserBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    is_active: bool
    criado_em: Optional[datetime]
    atualizado_em: Optional[datetime]


class Token(BaseModel):
    access_token: str
    token_type: str
