"""
Script para limpar e recriar usuários padrão no banco de dados
"""
from sqlalchemy.orm import sessionmaker
from app.database import engine, Base
from app.models.user import User
from app.routes.auth import get_password_hash

# Criar session
Session = sessionmaker(autocommit=False, autoflush=False, bind=engine)
session = Session()

try:
    # Deletar usuários existentes
    session.query(User).delete()
    session.commit()
    print("✓ Usuários antigos removido")
    
    # Criar usuário admin
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
    
    # Criar usuário de teste
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
    
    print("\n✓ Todos os usuários foram criados com sucesso!")
        
except Exception as e:
    print(f"✗ Erro ao criar usuários: {e}")
    import traceback
    traceback.print_exc()
    session.rollback()
finally:
    session.close()
