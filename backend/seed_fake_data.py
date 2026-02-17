"""
Script para popular todas as tabelas principais com 1 registro fake cada.
Deve ser executado após rodar as migrações e seed_users.py.
"""
from sqlalchemy.orm import sessionmaker
from app.database import engine, Base
from app.models.user import User
from app.models.funcionario import Funcionario
from app.models.pessoa_juridica import PessoaJuridica
from app.models.contato import Contato
from app.models.projeto import Projeto, StatusProjeto
from app.models.produto_servico import ProdutoServico, TipoProdutoServico, ProdutoServicoFornecedor
from app.models.despesa_projeto import DespesaProjeto, StatusDespesa, TipoFrete, DespesaProjetoItem
from app.models.faturamento import Faturamento
from app.models.cronograma import Cronograma
from app.routes.auth import get_password_hash
from datetime import datetime

Session = sessionmaker(autocommit=False, autoflush=False, bind=engine)
session = Session()

def get_or_create(model, defaults=None, **kwargs):
    instance = session.query(model).filter_by(**kwargs).first()
    if instance:
        return instance
    params = dict((k, v) for k, v in kwargs.items())
    if defaults:
        params.update(defaults)
    instance = model(**params)
    session.add(instance)
    session.commit()
    return instance

try:
    # Pessoa Jurídica (Fornecedor/Cliente)
    pj = get_or_create(
        PessoaJuridica,
        razao_social="Empresa Fake Ltda",
        nome_fantasia="Empresa Fake",
        sigla="FAK",
        tipo="Cliente",
        cnpj="12345678000199",
        cidade="Curitiba",
        estado="PR",
        pais="Brasil"
    )

    # Contato
    contato = get_or_create(Contato, nome="Contato Fake", email="contato@fake.com", pessoa_juridica_id=pj.id)

    # Usuário já criado pelo seed_users.py
    user = session.query(User).filter_by(username="admin").first()
    if not user:
        user = get_or_create(User, username="admin", email="admin@system.com", hashed_password=get_password_hash("admin123"), role="admin", is_active=True)

    # Funcionário
    funcionario = get_or_create(Funcionario, nome="Funcionário Fake", email="func@fake.com")

    # Projeto
    projeto = get_or_create(
        Projeto,
        numero="PRJ-0001",
        cliente_id=pj.id,
        nome="Projeto Fake",
        contato_id=contato.id,
        tecnico="Técnico Fake",
        status=StatusProjeto.ORCANDO.value
    )

    # Produto/Serviço
    produto = get_or_create(
        ProdutoServico,
        codigo_interno="PRD001",
        tipo=TipoProdutoServico.PRODUTO.value,
        unidade_medida="un",
        descricao="Produto Fake",
        preco_unitario=100.0
    )

    # ProdutoServicoFornecedor
    psf = get_or_create(
        ProdutoServicoFornecedor,
        produto_servico_id=produto.id,
        fornecedor_id=pj.id,
        codigo_fornecedor="CF001",
        preco_unitario=90.0
    )

    # Despesa Projeto
    from datetime import date
    despesa = get_or_create(
        DespesaProjeto,
        numero_despesa="DESP-0001",
        projeto_id=projeto.id,
        fornecedor_id=pj.id,
        tecnico_responsavel_id=funcionario.id,
        contato_id=contato.id,
        status=StatusDespesa.RASCUNHO.value,
        data_pedido=date.today(),
        tipo_frete=TipoFrete.CIF.value
    )

    # Itens de DespesaProjeto
    item = get_or_create(
        DespesaProjetoItem,
        despesa_projeto_id=despesa.id,
        produto_servico_id=produto.id,
        descricao="Item Fake de Despesa",
        quantidade=2,
        valor_unitario=100.0,
        icms=18.0,
        ipi=5.0,
        pis=1.65,
        cofins=7.6,
        iss=2.0
    )

    # Faturamento
    faturamento = get_or_create(
        Faturamento,
        projeto_id=projeto.id,
        tecnico_id=funcionario.id,
        valor_faturado=1000.0
    )

    # Cronograma
    cronograma = get_or_create(
        Cronograma,
        projeto_id=projeto.id,
        percentual_conclusao=10.0,
        atualizado_por_id=user.id
    )

    session.commit()
    print("✓ Dados fake inseridos com sucesso!")
except Exception as e:
    print(f"Erro ao inserir dados fake: {e}")
    session.rollback()
finally:
    session.close()
