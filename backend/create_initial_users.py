"""
Script para criar usuários iniciais no banco de dados
"""
from app.database import SessionLocal
from app.models.user import User
from app.routes.auth import get_password_hash

def create_initial_users():
    db = SessionLocal()
    
    try:
        # Verificar se já existem usuários
        existing_users = db.query(User).count()
        
        if existing_users > 0:
            print(f"⚠️  Já existem {existing_users} usuário(s) no banco de dados.")
            response = input("Deseja criar os usuários mesmo assim? (s/n): ")
            if response.lower() != 's':
                print("Operação cancelada.")
                return
        
        # Criar usuário admin
        admin_exists = db.query(User).filter(User.username == "admin").first()
        if not admin_exists:
            admin = User(
                username="admin",
                email="admin@taktcontrol.com.br",
                hashed_password=get_password_hash("admin123"),
                role="admin",
                is_active=True
            )
            db.add(admin)
            print("✅ Usuário 'admin' criado com sucesso!")
            print("   Username: admin")
            print("   Password: admin123")
            print("   Email: admin@taktcontrol.com.br")
            print("   Role: admin")
        else:
            print("⚠️  Usuário 'admin' já existe.")
        
        # Criar usuário user
        user_exists = db.query(User).filter(User.username == "user").first()
        if not user_exists:
            user = User(
                username="user",
                email="user@taktcontrol.com.br",
                hashed_password=get_password_hash("user123"),
                role="user",
                is_active=True
            )
            db.add(user)
            print("✅ Usuário 'user' criado com sucesso!")
            print("   Username: user")
            print("   Password: user123")
            print("   Email: user@taktcontrol.com.br")
            print("   Role: user")
        else:
            print("⚠️  Usuário 'user' já existe.")
        
        db.commit()
        print("\n✅ Operação concluída com sucesso!")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Erro ao criar usuários: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    print("🔧 Criando usuários iniciais...\n")
    create_initial_users()
