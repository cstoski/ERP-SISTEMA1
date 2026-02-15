"""
Script para verificar dados nas tabelas do banco
"""
from sqlalchemy.orm import sessionmaker
from app.database import engine, Base
from app.models.funcionario import Funcionario
from app.models.projeto import Projeto
from app.models.faturamento import Faturamento
from app.models.user import User

# Criar session
Session = sessionmaker(autocommit=False, autoflush=False, bind=engine)
session = Session()

try:
    print("\n=== DADOS NO BANCO ===\n")
    
    # Usuários
    users = session.query(User).all()
    print(f"✓ Usuários: {len(users)}")
    for user in users:
        print(f"  - {user.username} ({user.email})")
    
    # Funcionários
    funcionarios = session.query(Funcionario).all()
    print(f"\n✓ Funcionários: {len(funcionarios)}")
    for func in funcionarios[:5]:  # Mostrar apenas os 5 primeiros
        print(f"  - {func.nome} ({func.departamento})")
    if len(funcionarios) > 5:
        print(f"  ... e mais {len(funcionarios) - 5}")
    
    # Projetos
    projetos = session.query(Projeto).all()
    print(f"\n✓ Projetos: {len(projetos)}")
    for proj in projetos[:5]:
        print(f"  - {proj.nome}")
    if len(projetos) > 5:
        print(f"  ... e mais {len(projetos) - 5}")
    
    # Faturamentos
    faturamentos = session.query(Faturamento).all()
    print(f"\n✓ Faturamentos: {len(faturamentos)}")
    for fat in faturamentos[:5]:
        print(f"  - {fat.numero} ({fat.status})")
    if len(faturamentos) > 5:
        print(f"  ... e mais {len(faturamentos) - 5}")
    
    print("\n")
    
except Exception as e:
    print(f"✗ Erro: {e}")
    import traceback
    traceback.print_exc()
finally:
    session.close()
