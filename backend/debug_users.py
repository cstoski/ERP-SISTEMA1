"""
Script de debug para verificar usuários e senhas no banco
"""
from sqlalchemy.orm import sessionmaker
from app.database import engine, Base
from app.models.user import User
from app.routes.auth import get_password_hash, verify_password

# Criar session
Session = sessionmaker(autocommit=False, autoflush=False, bind=engine)
session = Session()

try:
    # Listar todos os usuários
    users = session.query(User).all()
    print(f"\n=== Usuários no banco ({len(users)} total) ===\n")
    
    for user in users:
        print(f"ID: {user.id}")
        print(f"Username: {user.username}")
        print(f"Email: {user.email}")
        print(f"Role: {user.role}")
        print(f"Active: {user.is_active}")
        print(f"Hashed Password: {user.hashed_password[:50]}...")
        print()
    
    # Testar verificação de senha
    print("=== Teste de Senhas ===\n")
    
    if users:
        test_user = users[0]
        test_password = "admin123"
        
        print(f"Usuário: {test_user.username}")
        print(f"Testando senha: {test_password}")
        print(f"Hash no banco: {test_user.hashed_password}")
        
        try:
            resultado = verify_password(test_password, test_user.hashed_password)
            print(f"Resultado da verificação: {resultado}")
        except Exception as e:
            print(f"Erro ao verificar: {e}")
        
        # Gerar novo hash para comparar
        print(f"\n--- Gerando novo hash ---")
        novo_hash = get_password_hash(test_password)
        print(f"Novo hash: {novo_hash}")
        print(f"Teste com novo hash: {verify_password(test_password, novo_hash)}")
    
except Exception as e:
    print(f"✗ Erro: {e}")
    import traceback
    traceback.print_exc()
finally:
    session.close()
