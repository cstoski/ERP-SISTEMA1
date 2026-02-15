"""
Script para criar usuário padrão no banco de dados
Executar uma única vez após iniciar o backend
"""
from sqlalchemy.orm import sessionmaker
from app.database import engine, Base
from app.models.user import User
from app.routes.auth import get_password_hash

# Criar todas as tabelas
Base.metadata.create_all(bind=engine)

# Criar session
Session = sessionmaker(autocommit=False, autoflush=False, bind=engine)
session = Session()

try:
    # Verificar se usuário já existe
    existing_user = session.query(User).filter(User.username == "admin").first()
    
    if existing_user:
        print("✓ Usuário 'admin' já existe no banco de dados")
    else:
        # Criar usuário padrão
        admin_user = User(
            username="admin",
            email="admin@system.com",
            hashed_password=get_password_hash("admin123"),
            role="admin",
            is_active=True
        )
        session.add(admin_user)
        session.commit()
        print("✓ Usuário 'admin' criado com sucesso!")
        print("  Login: admin")
        print("  Senha: admin123")
        print("  Email: admin@system.com")
    
    # Criar usuário de teste
    existing_test = session.query(User).filter(User.username == "user").first()
    
    if existing_test:
        print("✓ Usuário 'user' já existe no banco de dados")
    else:
        test_user = User(
            username="user",
            email="user@system.com",
            hashed_password=get_password_hash("user123"),
            role="user",
            is_active=True
        )
        session.add(test_user)
        session.commit()
        print("✓ Usuário 'user' criado com sucesso!")
        print("  Login: user")
        print("  Senha: user123")
        print("  Email: user@system.com")
        
except Exception as e:
    print(f"✗ Erro ao criar usuários: {e}")
    session.rollback()
finally:
    session.close()
