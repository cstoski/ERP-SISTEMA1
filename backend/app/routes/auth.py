from datetime import datetime, timedelta
from typing import Optional, List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from jose import JWTError, jwt
from fastapi.security import OAuth2PasswordBearer

from app import models
from app.schemas import user as user_schemas
from app.database import get_db
from app.email_utils import send_reset_password_email
import os

# NOTE: In production move these to secure config / env
SECRET_KEY = "CHANGE_THIS_SECRET_KEY"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7

# Usar argon2 em vez de bcrypt (mais estável)
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/token")


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password):
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


@router.post("/register", response_model=user_schemas.UserRead)
def register(user_in: user_schemas.UserCreate, db: Session = Depends(get_db)):
    existing = db.query(models.user.User).filter(
        (models.user.User.username == user_in.username) | (models.user.User.email == user_in.email)
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username or email already registered")
    hashed = get_password_hash(user_in.password)
    user = models.user.User(
        username=user_in.username,
        email=user_in.email,
        hashed_password=hashed,
        role=(user_in.role or "user"),
        is_active=False,  # Novos usuários começam inativos e precisam ser ativados pelo admin
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/token", response_model=user_schemas.Token)
def login_for_access_token(form_data: user_schemas.TokenRequest, db: Session = Depends(get_db)):
    print(f"Dados de login recebidos: {form_data}")
    print(f"Username: {form_data.username}, Password: {form_data.password}")
    
    user = db.query(models.user.User).filter(models.user.User.username == form_data.username).first()
    if not user:
        user = db.query(models.user.User).filter(models.user.User.email == form_data.username).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect username or password")
    if not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect username or password")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Sua conta está inativa. Entre em contato com um administrador para ativar sua conta.")

    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}


async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = db.query(models.user.User).filter(models.user.User.username == username).first()
    if user is None:
        raise credentials_exception
    return user


@router.get("/me", response_model=user_schemas.UserRead)
def read_current_user(current_user: models.user.User = Depends(get_current_user)):
    return current_user


@router.patch("/me", response_model=user_schemas.UserRead)
def update_current_user(
    body: dict,
    current_user: models.user.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Atualizar dados do usuário atual (username e/ou email)"""
    username = body.get("username")
    email = body.get("email")
    
    # Validação: pelo menos um dos campos deve ser fornecido
    if not username and not email:
        raise HTTPException(status_code=400, detail="Pelo menos um campo (username ou email) deve ser fornecido")
    
    # Validar username
    if username and username.strip():
        if len(username) < 3:
            raise HTTPException(status_code=400, detail="Usuário deve ter no mínimo 3 caracteres")
        # Verificar se username já existe (e não é o do usuário atual)
        existing_user = db.query(models.user.User).filter(
            (models.user.User.username == username) & (models.user.User.id != current_user.id)
        ).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Esse nome de usuário já está em uso")
        current_user.username = username
    
    # Validar email
    if email and email.strip():
        if not ("@" in email and "." in email):
            raise HTTPException(status_code=400, detail="Email inválido")
        # Verificar se email já existe (e não é do usuário atual)
        existing_user = db.query(models.user.User).filter(
            (models.user.User.email == email) & (models.user.User.id != current_user.id)
        ).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Esse email já está em uso")
        current_user.email = email
    
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    
    return current_user


@router.post("/change-password")
def change_password(
    body: dict,
    current_user: models.user.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Alterar a senha do usuário atual"""
    old_password = body.get("old_password")
    new_password = body.get("new_password")
    
    if not old_password or not new_password:
        raise HTTPException(status_code=400, detail="old_password e new_password são obrigatórios")
    
    if not verify_password(old_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Senha atual incorreta")
    
    if len(new_password) < 6:
        raise HTTPException(status_code=400, detail="Nova senha deve ter no mínimo 6 caracteres")
    
    current_user.hashed_password = get_password_hash(new_password)
    db.add(current_user)
    db.commit()
    
    return {"message": "Senha alterada com sucesso"}


# Rotas de Gestão de Usuários (apenas para admin)

def verify_admin(current_user: models.user.User = Depends(get_current_user)) -> models.user.User:
    """Verificar se o usuário é admin"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Acesso negado")
    return current_user


@router.get("/users", response_model=List[user_schemas.UserRead])
def listar_usuarios(admin_user: models.user.User = Depends(verify_admin), db: Session = Depends(get_db)):
    """Listar todos os usuários (apenas admin)"""
    usuarios = db.query(models.user.User).all()
    return usuarios


@router.delete("/users/{user_id}")
def deletar_usuario(
    user_id: int,
    admin_user: models.user.User = Depends(verify_admin),
    db: Session = Depends(get_db)
):
    """Deletar um usuário (apenas admin)"""
    if user_id == admin_user.id:
        raise HTTPException(status_code=400, detail="Não pode deletar seu próprio usuário")
    
    user = db.query(models.user.User).filter(models.user.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    db.delete(user)
    db.commit()
    return {"message": "Usuário deletado com sucesso"}


@router.patch("/users/{user_id}/toggle-status")
def toggle_status_usuario(
    user_id: int,
    admin_user: models.user.User = Depends(verify_admin),
    db: Session = Depends(get_db)
):
    """Ativar ou desativar um usuário (apenas admin)"""
    if user_id == admin_user.id:
        raise HTTPException(status_code=400, detail="Não pode desativar seu próprio usuário")
    
    user = db.query(models.user.User).filter(models.user.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    user.is_active = not user.is_active
    db.add(user)
    db.commit()
    db.refresh(user)
    return {
        "message": f"Usuário {'ativado' if user.is_active else 'desativado'} com sucesso",
        "is_active": user.is_active
    }


@router.post("/users/{user_id}/reset-password")
def reset_password_email(
    user_id: int,
    admin_user: models.user.User = Depends(verify_admin),
    db: Session = Depends(get_db)
):
    """Enviar email com instruções para resetar senha (apenas admin)"""
    user = db.query(models.user.User).filter(models.user.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    # Gerar token temporário para reset de senha (válido por 24 horas)
    temp_token = create_access_token(
        data={"sub": user.username, "type": "reset"},
        expires_delta=timedelta(hours=24)
    )
    
    # Gerar link de reset (ajuste a URL conforme sua aplicação)
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5174")
    reset_link = f"{frontend_url}/reset-senha?token={temp_token}"
    
    # Enviar email
    send_reset_password_email(
        user_email=user.email,
        username=user.username,
        reset_token=temp_token,
        reset_link=reset_link
    )
    
    return {
        "message": f"Email de reset de senha enviado para {user.email}",
    }


@router.post("/reset-password")
def reset_password_with_token(
    body: dict,
    db: Session = Depends(get_db)
):
    """Redefinir senha usando token de reset (sem autenticação)"""
    reset_token = body.get("token")
    new_password = body.get("new_password")
    confirm_password = body.get("confirm_password")
    
    # Validar campos
    if not reset_token or not new_password or not confirm_password:
        raise HTTPException(status_code=400, detail="Token, nova senha e confirmação são obrigatórios")
    
    if new_password != confirm_password:
        raise HTTPException(status_code=400, detail="As senhas não coincidem")
    
    if len(new_password) < 6:
        raise HTTPException(status_code=400, detail="Nova senha deve ter no mínimo 6 caracteres")
    
    # Validar token
    try:
        payload = jwt.decode(reset_token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        token_type: str = payload.get("type")
        
        if token_type != "reset":
            raise HTTPException(status_code=400, detail="Token inválido")
        
        if username is None:
            raise HTTPException(status_code=400, detail="Token inválido")
    except JWTError:
        raise HTTPException(status_code=400, detail="Token expirado ou inválido")
    
    # Encontrar usuário
    user = db.query(models.user.User).filter(models.user.User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    # Atualizar senha
    user.hashed_password = get_password_hash(new_password)
    db.add(user)
    db.commit()
    
    return {"message": "Senha redefinida com sucesso. Você já pode fazer login com sua nova senha."}
