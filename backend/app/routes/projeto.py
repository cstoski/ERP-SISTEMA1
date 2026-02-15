from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import and_, func
from typing import List
from datetime import datetime
from decimal import Decimal
from io import BytesIO

from ..database import get_db
from ..models.projeto import Projeto as ProjetoModel, StatusProjeto
from ..models.pessoa_juridica import PessoaJuridica as PessoaJuridicaModel
from ..models.contato import Contato as ContatoModel
from ..schemas.projeto import Projeto, ProjetoCreate, ProjetoUpdate
from openpyxl import Workbook, load_workbook
from openpyxl.styles import Font, PatternFill, Alignment

router = APIRouter()


def gerar_numero_projeto(db: Session, numero_manual: str = None) -> str:
    """Gera número de projeto automático ou valida manual"""
    if numero_manual:
        # Validar se número já existe
        existente = db.query(ProjetoModel).filter(ProjetoModel.numero == numero_manual).first()
        if existente:
            raise ValueError(f"Número de projeto '{numero_manual}' já existe")
        return numero_manual
    
    # Gerar automático: TC + ANO (2 dígitos) + MÊS (2 dígitos) + SEQUENCIAL (3 dígitos)
    now = datetime.now()
    ano = str(now.year)[-2:]  # Últimos 2 dígitos do ano
    mes = f"{now.month:02d}"   # Mês com zero à esquerda
    
    # Contar quantos projetos existem no ano atual com esse formato
    prefix = f"TC{ano}{mes}"
    
    # Contar projetos que começam com esse prefixo
    count = db.query(func.count(ProjetoModel.id)).filter(
        ProjetoModel.numero.like(f"{prefix}%")
    ).scalar() or 0
    
    sequencial = f"{count + 1:03d}"  # 3 dígitos com zeros à esquerda
    
    return f"{prefix}{sequencial}"


# Rotas com paths específicos
@router.get("/clientes", response_model=List[dict])
def listar_clientes(db: Session = Depends(get_db)):
    """Listar apenas pessoas jurídicas que são clientes"""
    clientes = db.query(PessoaJuridicaModel).filter(
        PessoaJuridicaModel.tipo == "Cliente"
    ).all()
    return [
        {
            "id": c.id,
            "razao_social": c.razao_social,
            "nome_fantasia": c.nome_fantasia,
            "cnpj": c.cnpj
        }
        for c in clientes
    ]


@router.get("/cliente/{cliente_id}/contatos", response_model=List[dict])
def listar_contatos_cliente(cliente_id: int, db: Session = Depends(get_db)):
    """Listar contatos de um cliente específico"""
    contatos = db.query(ContatoModel).filter(
        ContatoModel.pessoa_juridica_id == cliente_id
    ).all()
    return [
        {
            "id": c.id,
            "nome": c.nome,
            "email": c.email,
            "celular": c.celular
        }
        for c in contatos
    ]


@router.get("/proximo-numero")
def obter_proximo_numero(db: Session = Depends(get_db)):
    """Obter próximo número automático para projeto"""
    try:
        numero = gerar_numero_projeto(db)
        return {"numero": numero}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/export/excel")
def exportar_excel(db: Session = Depends(get_db)):
    """Exportar todos os projetos para arquivo Excel"""
    try:
        projetos = db.query(ProjetoModel).all()
        
        # Criar workbook
        wb = Workbook()
        ws = wb.active
        ws.title = "Projetos"
        
        # Definir headers
        headers = [
            "Número",
            "Cliente",
            "Nome do Projeto",
            "Contato",
            "Técnico",
            "Valor Orçado",
            "Valor de Venda",
            "Prazo (dias)",
            "Data Pedido Compra",
            "Status",
            "Data de Criação",
            "Última Atualização"
        ]
        
        ws.append(headers)
        
        # Estilo do header
        header_font = Font(bold=True, color="FFFFFF")
        header_fill = PatternFill(start_color="4472C4", end_color="4472C4", fill_type="solid")
        header_alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
        
        for cell in ws[1]:
            cell.font = header_font
            cell.fill = header_fill
            cell.alignment = header_alignment
        
        # Adicionar dados
        for projeto in projetos:
            cliente = db.query(PessoaJuridicaModel).filter(
                PessoaJuridicaModel.id == projeto.cliente_id
            ).first()
            contato = db.query(ContatoModel).filter(
                ContatoModel.id == projeto.contato_id
            ).first()
            
            cliente_nome = cliente.razao_social if cliente else "N/A"
            contato_nome = contato.nome if contato else "N/A"
            
            ws.append([
                projeto.numero,
                cliente_nome,
                projeto.nome,
                contato_nome,
                projeto.tecnico,
                float(projeto.valor_orcado) if projeto.valor_orcado else 0.00,
                float(projeto.valor_venda) if projeto.valor_venda else 0.00,
                projeto.prazo_entrega_dias,
                projeto.data_pedido_compra.isoformat() if projeto.data_pedido_compra else "",
                projeto.status.value,
                projeto.criado_em.isoformat() if projeto.criado_em else "",
                projeto.atualizado_em.isoformat() if projeto.atualizado_em else ""
            ])
        
        # Ajustar largura das colunas
        ws.column_dimensions['A'].width = 12
        ws.column_dimensions['B'].width = 25
        ws.column_dimensions['C'].width = 25
        ws.column_dimensions['D'].width = 20
        ws.column_dimensions['E'].width = 15
        ws.column_dimensions['F'].width = 15
        ws.column_dimensions['G'].width = 15
        ws.column_dimensions['H'].width = 12
        ws.column_dimensions['I'].width = 18
        ws.column_dimensions['J'].width = 18
        ws.column_dimensions['K'].width = 20
        ws.column_dimensions['L'].width = 20
        
        # Salvar em memória
        output = BytesIO()
        wb.save(output)
        output.seek(0)
        
        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": "attachment; filename=projetos.xlsx"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao exportar: {str(e)}")


@router.post("/import/excel")
async def importar_excel(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """Importar projetos de arquivo Excel"""
    if not file.filename.endswith(('.xlsx', '.xls')):
        raise HTTPException(status_code=400, detail="Arquivo deve ser em formato Excel (.xlsx ou .xls)")
    
    try:
        contents = await file.read()
        wb = load_workbook(BytesIO(contents))
        ws = wb.active
        
        projetos_importados = []
        erros = []
        
        for idx, row in enumerate(ws.iter_rows(min_row=2, values_only=True), start=2):
            try:
                dados = {}
                headers_arquivo = [cell.value for cell in ws[1]]
                
                for header_idx, header in enumerate(headers_arquivo):
                    if header and row[header_idx] is not None:
                        header_lower = header.lower()
                        if header_lower == "número":
                            dados['numero'] = str(row[header_idx])
                        elif header_lower == "cliente":
                            cliente = db.query(PessoaJuridicaModel).filter(
                                PessoaJuridicaModel.razao_social == row[header_idx]
                            ).first()
                            if not cliente:
                                erros.append(f"Linha {idx}: Cliente '{row[header_idx]}' não encontrado")
                                raise ValueError("Cliente não encontrado")
                            dados['cliente_id'] = cliente.id
                        elif header_lower == "nome do projeto":
                            dados['nome'] = row[header_idx]
                        elif header_lower == "contato":
                            contato = db.query(ContatoModel).filter(
                                ContatoModel.nome == row[header_idx]
                            ).first()
                            if not contato:
                                erros.append(f"Linha {idx}: Contato '{row[header_idx]}' não encontrado")
                                raise ValueError("Contato não encontrado")
                            dados['contato_id'] = contato.id
                        elif header_lower == "técnico":
                            dados['tecnico'] = row[header_idx]
                        elif header_lower == "valor orçado":
                            dados['valor_orcado'] = Decimal(str(row[header_idx]))
                        elif header_lower == "valor de venda":
                            dados['valor_venda'] = Decimal(str(row[header_idx]))
                        elif header_lower == "prazo (dias)":
                            dados['prazo_entrega_dias'] = int(row[header_idx])
                        elif header_lower == "data pedido compra" and row[header_idx]:
                            if isinstance(row[header_idx], datetime):
                                dados['data_pedido_compra'] = row[header_idx]
                        elif header_lower == "status":
                            dados['status'] = row[header_idx]
                
                # Validações obrigatórias
                if not dados.get('numero'):
                    erros.append(f"Linha {idx}: Número é obrigatório")
                    continue
                
                if not dados.get('cliente_id'):
                    erros.append(f"Linha {idx}: Cliente é obrigatório")
                    continue
                
                if not dados.get('nome'):
                    erros.append(f"Linha {idx}: Nome do projeto é obrigatório")
                    continue
                
                if not dados.get('contato_id'):
                    erros.append(f"Linha {idx}: Contato é obrigatório")
                    continue
                
                if not dados.get('tecnico'):
                    erros.append(f"Linha {idx}: Técnico é obrigatório")
                    continue
                
                # Validar duplicidade de número
                existente = db.query(ProjetoModel).filter(
                    ProjetoModel.numero == dados['numero']
                ).first()
                
                if existente:
                    erros.append(f"Linha {idx}: Projeto com número '{dados['numero']}' já existe")
                    continue
                
                novo_projeto = ProjetoModel(**dados)
                db.add(novo_projeto)
                projetos_importados.append(dados.get('numero'))
                
            except Exception as e:
                if not any(f"Linha {idx}" in erro for erro in erros):
                    erros.append(f"Linha {idx}: {str(e)}")
        
        if projetos_importados:
            db.commit()
        
        return {
            "message": f"{len(projetos_importados)} projeto(s) importado(s) com sucesso",
            "importados": projetos_importados,
            "erros": erros if erros else None,
            "total_sucesso": len(projetos_importados),
            "total_erros": len(erros)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao importar arquivo: {str(e)}")


# Rotas com paths dinâmicos
@router.post("/", response_model=Projeto)
def criar_projeto(projeto: ProjetoCreate, db: Session = Depends(get_db)):
    try:
        # Validar/gerar número
        numero = gerar_numero_projeto(db, projeto.numero)
        
        db_projeto = ProjetoModel(
            **projeto.model_dump(exclude={'numero'}),
            numero=numero
        )
        db.add(db_projeto)
        db.commit()
        db.refresh(db_projeto)
        return db_projeto
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/", response_model=List[Projeto])
def ler_todos_projetos(db: Session = Depends(get_db)):
    projetos = db.query(ProjetoModel).all()
    return projetos


@router.get("/{projeto_id}", response_model=Projeto)
def obter_projeto(projeto_id: int, db: Session = Depends(get_db)):
    projeto = db.query(ProjetoModel).filter(ProjetoModel.id == projeto_id).first()
    if not projeto:
        raise HTTPException(status_code=404, detail="Projeto não encontrado")
    return projeto


@router.put("/{projeto_id}", response_model=Projeto)
def atualizar_projeto(projeto_id: int, projeto: ProjetoUpdate, db: Session = Depends(get_db)):
    db_projeto = db.query(ProjetoModel).filter(ProjetoModel.id == projeto_id).first()
    if not db_projeto:
        raise HTTPException(status_code=404, detail="Projeto não encontrado")
    
    update_data = projeto.model_dump(exclude_unset=True)
    
    # Se número foi alterado, validar unicidade
    if 'numero' in update_data and update_data['numero'] != db_projeto.numero:
        existente = db.query(ProjetoModel).filter(
            ProjetoModel.numero == update_data['numero']
        ).first()
        if existente:
            raise HTTPException(status_code=400, detail="Número de projeto já existe")
    
    for key, value in update_data.items():
        setattr(db_projeto, key, value)
    
    db.add(db_projeto)
    db.commit()
    db.refresh(db_projeto)
    return db_projeto


@router.delete("/{projeto_id}", response_model=Projeto)
def deletar_projeto(projeto_id: int, db: Session = Depends(get_db)):
    db_projeto = db.query(ProjetoModel).filter(ProjetoModel.id == projeto_id).first()
    if not db_projeto:
        raise HTTPException(status_code=404, detail="Projeto não encontrado")
    
    db.delete(db_projeto)
    db.commit()
    return db_projeto
