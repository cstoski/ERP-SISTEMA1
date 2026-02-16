# 📋 Documentação de Regras de Negócio - ERP Sistema TAKT

Este documento descreve as regras de negócio, validações e comportamentos de cada modelo do sistema backend.

## 📑 Índice

1. [User (Usuários)](#1-user-usuários)
2. [Pessoa Jurídica](#2-pessoa-jurídica)
3. [Contato](#3-contato)
4. [Projeto](#4-projeto)
5. [Funcionário](#5-funcionário)
6. [Faturamento](#6-faturamento)
7. [Produto/Serviço](#7-produtoserviço)
8. [Cronograma](#8-cronograma)
9. [Despesa de Projeto](#9-despesa-de-projeto)
10. [Relacionamentos entre Modelos](#10-relacionamentos-entre-modelos)

---

## 1. User (Usuários)

### 📝 Descrição
Gerencia os usuários do sistema com autenticação e controle de acesso.

### 🔑 Campos

| Campo | Tipo | Obrigatório | Único | Descrição |
|-------|------|-------------|-------|-----------|
| `id` | Integer | Auto | Sim | Identificador único |
| `username` | String(128) | Sim | Sim | Nome de usuário para login |
| `email` | String(256) | Sim | Sim | Email do usuário |
| `hashed_password` | String(256) | Sim | Não | Senha criptografada |
| `role` | String(50) | Não | Não | Papel do usuário (default: "user") |
| `is_active` | Boolean | Não | Não | Status de ativação (default: true) |
| `criado_em` | DateTime | Auto | Não | Data/hora de criação |
| `atualizado_em` | DateTime | Auto | Não | Data/hora da última atualização |

### 📐 Regras de Negócio

#### Validações
- ✅ **Username único**: Não pode haver dois usuários com o mesmo username
- ✅ **Email único**: Email deve ser único no sistema
- ✅ **Email válido**: Validação de formato de email
- ✅ **Senha forte**: Mínimo de 8 caracteres (recomendado)
- ✅ **Criptografia**: Senha NUNCA armazenada em texto puro, usa Argon2

#### Roles Disponíveis
- **`admin`**: Acesso total ao sistema
- **`user`**: Acesso limitado (usuário padrão)

#### Autenticação
- **JWT Token**: Gerado no login, válido por 480 minutos (8 horas)
- **Algoritmo**: HS256
- **Refresh**: Token deve ser renovado após expiração

#### Status
- **Ativo (`is_active=true`)**: Pode fazer login e usar o sistema
- **Inativo (`is_active=false`)**: Não pode fazer login, mas dados são mantidos

### 🔒 Endpoints Protegidos
- `POST /api/auth/register` - Criar novo usuário (apenas admin)
- `POST /api/auth/token` - Login (público)
- `GET /api/auth/me` - Dados do usuário logado (autenticado)
- `PATCH /api/auth/me` - Atualizar próprio perfil (autenticado)
- `GET /api/auth/users` - Listar usuários (apenas admin)
- `DELETE /api/auth/users/{id}` - Deletar usuário (apenas admin)
- `PATCH /api/auth/users/{id}/toggle-status` - Ativar/desativar (apenas admin)
- `POST /api/auth/change-password` - Mudar senha (autenticado)

### 💡 Casos de Uso

**Criação de Usuário:**
```json
{
  "username": "joao.silva",
  "email": "joao@empresa.com",
  "password": "Senha@123",
  "role": "user"
}
```

**Login:**
```json
{
  "username": "joao.silva",
  "password": "Senha@123"
}
```

**Resposta (Token):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

---

## 2. Pessoa Jurídica

### 📝 Descrição
Representa empresas (clientes, fornecedores, etc.) cadastradas no sistema.

### 🔑 Campos

| Campo | Tipo | Obrigatório | Único | Descrição |
|-------|------|-------------|-------|-----------|
| `id` | Integer | Auto | Sim | Identificador único |
| `razao_social` | String | Sim | Não | Razão social da empresa |
| `nome_fantasia` | String | Não | Não | Nome fantasia |
| `sigla` | String(3) | Sim | Sim | Sigla de 1-3 caracteres (maiúsculas) |
| `tipo` | String | Não | Não | Tipo (default: "Cliente") |
| `cnpj` | String | Sim | Sim | CNPJ com validação de dígitos |
| `inscricao_estadual` | String | Não | Não | IE da empresa |
| `inscricao_municipal` | String | Não | Não | IM da empresa |
| `endereco` | String | Não | Não | Endereço completo |
| `complemento` | String | Não | Não | Complemento do endereço |
| `cidade` | String | Não | Não | Cidade (default: "Curitiba") |
| `estado` | String | Não | Não | UF (default: "PR") |
| `cep` | String | Não | Não | CEP |
| `pais` | String | Não | Não | País (default: "Brasil") |
| `criado_em` | DateTime | Auto | Não | Data/hora de criação |
| `atualizado_em` | DateTime | Auto | Não | Data/hora da última atualização |

### 📐 Regras de Negócio

#### Validações

**Sigla:**
- ✅ Mínimo: 1 caractere
- ✅ Máximo: 3 caracteres
- ✅ Conversão automática para MAIÚSCULAS
- ✅ Deve ser única no sistema
- ❌ Não pode conter espaços ou caracteres especiais

**CNPJ:**
- ✅ Exatamente 14 dígitos numéricos
- ✅ Validação de dígitos verificadores (algoritmo da Receita Federal)
- ✅ Armazenado apenas com números (remove formatação)
- ✅ Deve ser único no sistema
- ❌ CNPJ inválido é rejeitado

**Validação de CNPJ:**
```python
# Algoritmo de validação:
# 1. Remove formatação (mantém apenas números)
# 2. Valida primeiro dígito verificador
# 3. Valida segundo dígito verificador
# 4. Retorna erro se inválido
```

#### Tipos Disponíveis
- **Cliente**: Empresa que contrata projetos
- **Fornecedor**: Empresa que fornece produtos/serviços
- **Ambos**: Pode ser cliente e fornecedor

#### Defaults
- **cidade**: "Curitiba"
- **estado**: "PR"
- **pais**: "Brasil"
- **tipo**: "Cliente"

### 🔗 Relacionamentos

**Possui (One-to-Many):**
- `contatos[]`: Lista de contatos da empresa
- `projetos[]`: Projetos onde é cliente

**É referenciado por:**
- `ProdutoServicoFornecedor`: Como fornecedor de produtos
- `DespesaProjeto`: Como fornecedor em despesas

**Cascade Delete:**
- ⚠️ Ao deletar uma Pessoa Jurídica, todos os seus contatos e projetos são deletados

### 💡 Casos de Uso

**Criar Empresa:**
```json
{
  "razao_social": "EMPRESA EXEMPLO LTDA",
  "nome_fantasia": "Empresa Exemplo",
  "sigla": "EEL",
  "tipo": "Cliente",
  "cnpj": "12.345.678/0001-95",
  "inscricao_estadual": "123456789",
  "endereco": "Rua Exemplo, 123",
  "cidade": "Curitiba",
  "estado": "PR",
  "cep": "80000-000"
}
```

**Buscar por Tipo:**
- Filtrar por `tipo="Cliente"` para listar apenas clientes
- Filtrar por `tipo="Fornecedor"` para listar fornecedores

**Buscar por Sigla:**
- Siglas são únicas e podem ser usadas como identificador rápido
- Exemplo: `GET /api/pessoas-juridicas?sigla=EEL`

---

## 3. Contato

### 📝 Descrição
Representa pessoas de contato vinculadas a uma Pessoa Jurídica (empresa).

### 🔑 Campos

| Campo | Tipo | Obrigatório | Único | Descrição |
|-------|------|-------------|-------|-----------|
| `id` | Integer | Auto | Sim | Identificador único |
| `pessoa_juridica_id` | Integer | Sim | Não | FK para Pessoa Jurídica |
| `nome` | String | Sim | Não | Nome da pessoa de contato |
| `departamento` | String | Não | Não | Departamento/setor |
| `telefone_fixo` | String | Não | Não | Telefone fixo |
| `celular` | String | Não | Não | Telefone celular |
| `email` | String | Não | Não | Email do contato |
| `criado_em` | DateTime | Auto | Não | Data/hora de criação |
| `atualizado_em` | DateTime | Auto | Não | Data/hora da última atualização |

### 📐 Regras de Negócio

#### Validações
- ✅ **Nome obrigatório**: Contato deve ter um nome
- ✅ **Email válido**: Se fornecido, deve ter formato válido
- ✅ **Empresa válida**: `pessoa_juridica_id` deve existir
- ⚠️ Pelo menos um meio de contato recomendado (telefone ou email)

#### Vinculação
- 🔗 **Obrigatoriamente vinculado** a uma Pessoa Jurídica
- 📞 Um contato pode ser usado em múltiplos projetos
- 🗑️ Deletado automaticamente se a empresa for deletada (cascade)

### 🔗 Relacionamentos

**Pertence a:**
- `pessoa_juridica`: Empresa a qual o contato pertence

**É usado em:**
- `projetos[]`: Projetos que usam este contato

**Cascade Delete:**
- ⚠️ Se a Pessoa Jurídica for deletada, o contato é deletado
- ⚠️ Se o contato for deletado, os projetos vinculados também são deletados

### 💡 Casos de Uso

**Criar Contato:**
```json
{
  "pessoa_juridica_id": 1,
  "nome": "Maria Santos",
  "departamento": "Compras",
  "telefone_fixo": "(41) 3333-4444",
  "celular": "(41) 99999-8888",
  "email": "maria.santos@empresa.com"
}
```

**Listar Contatos de uma Empresa:**
- `GET /api/contatos?pessoa_juridica_id=1`

---

## 4. Projeto

### 📝 Descrição
Gerencia projetos/orçamentos de clientes, com controle de status, valores e prazos.

### 🔑 Campos

| Campo | Tipo | Obrigatório | Único | Descrição |
|-------|------|-------------|-------|-----------|
| `id` | Integer | Auto | Sim | Identificador único |
| `numero` | String(50) | Sim | Sim | Número do projeto (único) |
| `cliente_id` | Integer | Sim | Não | FK para Pessoa Jurídica (cliente) |
| `nome` | String(255) | Sim | Não | Nome/descrição do projeto |
| `contato_id` | Integer | Sim | Não | FK para Contato (pessoa de contato) |
| `tecnico` | String(255) | Sim | Não | Nome do técnico responsável |
| `valor_orcado` | Decimal(15,2) | Não | Não | Valor orçado (default: 0.00) |
| `valor_venda` | Decimal(15,2) | Não | Não | Valor de venda (default: 0.00) |
| `prazo_entrega_dias` | Integer | Não | Não | Prazo em dias (default: 0) |
| `data_pedido_compra` | DateTime | Não | Não | Data do pedido de compra |
| `status` | Enum | Não | Não | Status do projeto |
| `criado_em` | DateTime | Auto | Não | Data/hora de criação |
| `atualizado_em` | DateTime | Auto | Não | Data/hora da última atualização |

### 📐 Regras de Negócio

#### Status do Projeto (Enum)

| Status | Descrição | Fluxo |
|--------|-----------|-------|
| **Orçando** | Projeto em fase de orçamento | Inicial |
| **Orçamento Enviado** | Orçamento enviado ao cliente | Após orçamento |
| **Declinado** | Cliente recusou o orçamento | Final (negativo) |
| **Aguardando pedido de compra** | Aguardando PO do cliente | Intermediário |
| **Teste de Viabilidade** | Em fase de testes/validação | Intermediário |
| **Em Execução** | Projeto aprovado e em execução | Ativo |
| **Concluído** | Projeto finalizado | Final (positivo) |

#### Validações
- ✅ **Número único**: Não pode haver dois projetos com mesmo número
- ✅ **Status válido**: Deve ser um dos valores do enum
- ✅ **Cliente válido**: `cliente_id` deve existir em Pessoa Jurídica
- ✅ **Contato válido**: `contato_id` deve existir e pertencer ao cliente
- ✅ **Valores não negativos**: `valor_orcado` e `valor_venda` >= 0
- ✅ **Prazo não negativo**: `prazo_entrega_dias` >= 0

#### Fluxo Típico
```
Orçando → Orçamento Enviado → Aguardando pedido → Em Execução → Concluído
                    ↓
                Declinado (se rejeitado)
```

#### Cálculos
- **Margem de lucro**: `valor_venda - valor_orcado`
- **Percentual de margem**: `((valor_venda - valor_orcado) / valor_orcado) * 100`

### 🔗 Relacionamentos

**Pertence a:**
- `cliente`: Pessoa Jurídica (tipo Cliente)
- `contato`: Contato da empresa cliente

**Possui (One-to-Many):**
- `faturamentos[]`: Faturamentos do projeto
- `despesas[]`: Despesas do projeto
- `cronograma`: Um cronograma (One-to-One)

**Cascade Delete:**
- ⚠️ Ao deletar projeto, todos faturamentos e despesas são deletados

### 💡 Casos de Uso

**Criar Projeto:**
```json
{
  "numero": "PROJ-2026-001",
  "cliente_id": 1,
  "nome": "Implementação Sistema ERP",
  "contato_id": 5,
  "tecnico": "João Silva",
  "valor_orcado": 50000.00,
  "valor_venda": 60000.00,
  "prazo_entrega_dias": 90,
  "status": "Orçando"
}
```

**Atualizar Status:**
```json
{
  "status": "Em Execução",
  "data_pedido_compra": "2026-02-16T10:00:00"
}
```

**Filtros Comuns:**
- Por status: `GET /api/projetos?status=Em Execução`
- Por cliente: `GET /api/projetos?cliente_id=1`
- Por técnico: `GET /api/projetos?tecnico=João Silva`

---

## 5. Funcionário

### 📝 Descrição
Cadastro de funcionários/colaboradores da empresa (internos).

### 🔑 Campos

| Campo | Tipo | Obrigatório | Único | Descrição |
|-------|------|-------------|-------|-----------|
| `id` | Integer | Auto | Sim | Identificador único |
| `nome` | String | Sim | Não | Nome do funcionário |
| `departamento` | String | Não | Não | Departamento/setor |
| `telefone_fixo` | String | Não | Não | Telefone fixo |
| `celular` | String | Não | Não | Telefone celular |
| `email` | String | Não | Não | Email corporativo |
| `criado_em` | DateTime | Auto | Não | Data/hora de criação |
| `atualizado_em` | DateTime | Auto | Não | Data/hora da última atualização |

### 📐 Regras de Negócio

#### Validações
- ✅ **Nome obrigatório**: Funcionário deve ter um nome
- ℹ️ Campos opcionais: departamento, telefones, email

#### Uso
- 👤 Usado em **Faturamentos** como técnico responsável
- 👤 Usado em **Despesas de Projeto** como técnico responsável
- 📊 Permite rastreamento de faturamento por funcionário

### 🔗 Relacionamentos

**É referenciado por:**
- `Faturamento.tecnico_id`: Técnico que faturou
- `DespesaProjeto.tecnico_responsavel_id`: Responsável pela despesa

### 💡 Casos de Uso

**Criar Funcionário:**
```json
{
  "nome": "Carlos Oliveira",
  "departamento": "Engenharia",
  "celular": "(41) 99888-7766",
  "email": "carlos.oliveira@empresa.com"
}
```

**Relatório de Faturamento por Funcionário:**
- Agrupar faturamentos por `tecnico_id`
- Somar `valor_faturado` por técnico

---

## 6. Faturamento

### 📝 Descrição
Registra faturamentos realizados em projetos, vinculados a técnicos.

### 🔑 Campos

| Campo | Tipo | Obrigatório | Único | Descrição |
|-------|------|-------------|-------|-----------|
| `id` | Integer | Auto | Sim | Identificador único |
| `projeto_id` | Integer | Sim | Não | FK para Projeto |
| `tecnico_id` | Integer | Sim | Não | FK para Funcionário |
| `valor_faturado` | Decimal(15,2) | Sim | Não | Valor do faturamento |
| `data_faturamento` | DateTime | Auto | Não | Data/hora do faturamento |
| `observacoes` | Text | Não | Não | Observações adicionais |
| `criado_em` | DateTime | Auto | Não | Data/hora de criação |
| `atualizado_em` | DateTime | Auto | Não | Data/hora da última atualização |

### 📐 Regras de Negócio

#### Validações
- ✅ **Valor obrigatório**: `valor_faturado` é requerido
- ✅ **Valor não negativo**: `valor_faturado` >= 0.00
- ✅ **Projeto válido**: `projeto_id` deve existir
- ✅ **Técnico válido**: `tecnico_id` deve existir em Funcionário
- ⚠️ Data automática: `data_faturamento` usa timestamp do servidor

#### Múltiplos Faturamentos
- ✅ Um projeto pode ter múltiplos faturamentos (parcelas)
- ✅ Somatória dos valores = faturamento total do projeto

#### Controles Recomendados
- ⚠️ Verificar se soma dos faturamentos não excede valor de venda
- 📊 Rastrear faturamento por projeto
- 📊 Rastrear faturamento por técnico
- 📊 Rastrear faturamento por período

### 🔗 Relacionamentos

**Pertence a:**
- `projeto`: Projeto faturado
- `tecnico`: Funcionário responsável

**Cascade Delete:**
- ⚠️ Deletado se o projeto for deletado

### 💡 Casos de Uso

**Registrar Faturamento:**
```json
{
  "projeto_id": 10,
  "tecnico_id": 3,
  "valor_faturado": 15000.00,
  "observacoes": "Primeira parcela - 25%"
}
```

**Consultar Total Faturado de um Projeto:**
```sql
SELECT SUM(valor_faturado) 
FROM faturamentos 
WHERE projeto_id = 10
```

**Relatório Mensal:**
- Filtrar por período: `data_faturamento BETWEEN inicio AND fim`
- Agrupar por técnico ou projeto

---

## 7. Produto/Serviço

### 📝 Descrição
Cadastro de produtos e serviços com múltiplos fornecedores e histórico de preços.

### 🔑 Campos Principais

#### ProdutoServico

| Campo | Tipo | Obrigatório | Único | Descrição |
|-------|------|-------------|-------|-----------|
| `id` | Integer | Auto | Sim | Identificador único |
| `codigo_interno` | String(8) | Auto | Sim | Código gerado automaticamente |
| `tipo` | Enum | Sim | Não | "Produto" ou "Serviço" |
| `unidade_medida` | String(20) | Sim | Não | UN, KG, M, L, etc. |
| `descricao` | String(255) | Sim | Não | Descrição do item |
| `codigo_fabricante` | String(50) | Não | Não | Código do fabricante |
| `nome_fabricante` | String(255) | Não | Não | Nome do fabricante |
| `preco_unitario` | Decimal(15,2) | Não | Não | Preço de referência |
| `ncm_lcp` | String(50) | Não | Não | Classificação fiscal NCM/LCP |
| `criado_em` | DateTime | Auto | Não | Data/hora de criação |
| `atualizado_em` | DateTime | Auto | Não | Data/hora da última atualização |

#### ProdutoServicoFornecedor (Relacionamento M-N)

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|----------|
| `id` | Integer | Auto | Identificador único |
| `produto_servico_id` | Integer | Sim | FK para ProdutoServico |
| `fornecedor_id` | Integer | Sim | FK para PessoaJuridica |
| `codigo_fornecedor` | String(50) | Sim | Código no catálogo do fornecedor |
| `preco_unitario` | Decimal(15,2) | Não | Preço deste fornecedor |
| `prazo_entrega_dias` | Integer | Não | Prazo de entrega |
| `icms` | Decimal(5,2) | Não | Alíquota ICMS (%) |
| `ipi` | Decimal(5,2) | Não | Alíquota IPI (%) |
| `pis` | Decimal(5,2) | Não | Alíquota PIS (%) |
| `cofins` | Decimal(5,2) | Não | Alíquota COFINS (%) |
| `iss` | Decimal(5,2) | Não | Alíquota ISS (%) |

#### ProdutoServicoHistoricoPreco

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|----------|
| `id` | Integer | Auto | Identificador único |
| `produto_servico_id` | Integer | Sim | FK para ProdutoServico |
| `preco_medio` | Decimal(15,2) | Sim | Preço médio no período |
| `preco_minimo` | Decimal(15,2) | Sim | Menor preço encontrado |
| `preco_maximo` | Decimal(15,2) | Sim | Maior preço encontrado |
| `registrado_em` | DateTime | Auto | Data/hora do registro |

### 📐 Regras de Negócio

#### Tipo de Item (Enum)
- **Produto**: Item físico
- **Serviço**: Serviço/mão de obra

#### Código Interno
- 🔢 Gerado automaticamente
- 📏 Formato: 8 caracteres alfanuméricos
- ✅ Único no sistema
- 🔒 Não pode ser alterado após criação

#### Unidades de Medida Comuns
- **UN**: Unidade
- **KG**: Quilograma
- **M**: Metro
- **M²**: Metro quadrado
- **L**: Litro
- **CX**: Caixa
- **PC**: Peça
- **HR**: Hora (para serviços)

#### NCM/LCP
- 📋 Nomenclatura Comum do Mercosul
- 🏷️ Classificação fiscal obrigatória para produtos
- ℹ️ Opcional para serviços

#### Múltiplos Fornecedores
- ✅ Um produto pode ter vários fornecedores
- 💰 Cada fornecedor tem seu próprio preço e condições
- 📊 Permite comparação entre fornecedores
- 🔍 Facilita cotação de preços

#### Impostos
- 📊 Armazenados como percentuais (0.00 a 99.99)
- 💡 Usados para cálculo de custo total
- ⚖️ Variam por fornecedor

#### Histórico de Preços
- 📈 Registra variação de preços ao longo do tempo
- 📊 Calcula média, mínimo e máximo
- 🕐 Permite análise temporal
- 💡 Auxilia em negociações

### 🔗 Relacionamentos

**Possui:**
- `fornecedores[]`: Lista de fornecedores (ProdutoServicoFornecedor)

**Referenciado por:**
- `ProdutoServicoHistoricoPreco`: Histórico de variação de preços

### 💡 Casos de Uso

**Cadastrar Produto com Fornecedores:**
```json
{
  "tipo": "Produto",
  "unidade_medida": "UN",
  "descricao": "Parafuso M8 x 20mm",
  "codigo_fabricante": "PAR-M8-20",
  "nome_fabricante": "Metalúrgica ABC",
  "preco_unitario": 0.50,
  "ncm_lcp": "7318.15.00",
  "fornecedores": [
    {
      "fornecedor_id": 10,
      "codigo_fornecedor": "PAR-001",
      "preco_unitario": 0.45,
      "prazo_entrega_dias": 7,
      "icms": 18.00,
      "ipi": 5.00
    },
    {
      "fornecedor_id": 15,
      "codigo_fornecedor": "ITEM-PAR-20",
      "preco_unitario": 0.48,
      "prazo_entrega_dias": 10,
      "icms": 18.00,
      "ipi": 5.00
    }
  ]
}
```

**Cadastrar Serviço:**
```json
{
  "tipo": "Serviço",
  "unidade_medida": "HR",
  "descricao": "Mão de obra especializada em elétrica",
  "preco_unitario": 80.00
}
```

**Comparar Fornecedores:**
- Filtrar por `produto_servico_id`
- Ordenar por `preco_unitario` ou `prazo_entrega_dias`
- Considerar impostos no cálculo total

---

## 8. Cronograma

### 📝 Descrição
Gerencia o cronograma de execução de projetos com histórico de atualizações.

### 🔑 Campos Principais

#### Cronograma

| Campo | Tipo | Obrigatório | Único | Descrição |
|-------|------|-------------|-------|-----------|
| `id` | Integer | Auto | Sim | Identificador único |
| `projeto_id` | Integer | Sim | Sim | FK para Projeto (one-to-one) |
| `percentual_conclusao` | Decimal(5,2) | Não | Não | 0.00 a 100.00% |
| `observacoes` | Text | Não | Não | Observações sobre o status |
| `atualizado_em` | DateTime | Auto | Não | Data/hora da última atualização |
| `atualizado_por_id` | Integer | Não | Não | FK para User (quem atualizou) |

#### CronogramaHistorico

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|----------|
| `id` | Integer | Auto | Identificador único |
| `cronograma_id` | Integer | Sim | FK para Cronograma |
| `percentual_conclusao` | Decimal(5,2) | Sim | Percentual naquele momento |
| `observacoes` | Text | Não | Observações da atualização |
| `criado_em` | DateTime | Auto | Data/hora do registro |
| `criado_por_id` | Integer | Não | FK para User (quem registrou) |

### 📐 Regras de Negócio

#### Percentual de Conclusão
- ✅ Valor entre **0.00% e 100.00%**
- 📊 Precisão de 2 casas decimais
- 🎯 0% = Não iniciado
- 🎯 100% = Concluído
- 📈 Valores intermediários = Em andamento

#### Relacionamento One-to-One
- 1️⃣ Cada projeto tem **no máximo um** cronograma
- ✅ Projeto pode existir sem cronograma
- 🔗 Cronograma sempre vinculado a um projeto

#### Histórico Automático
- 📝 Cada atualização cria um registro no histórico
- ⏰ Ordenado do mais recente para o mais antigo
- 👤 Rastreia quem fez cada alteração
- 📊 Permite análise de evolução temporal

#### Validações
- ✅ **Percentual válido**: 0 ≤ percentual ≤ 100
- ✅ **Projeto único**: Um projeto não pode ter dois cronogramas
- ✅ **Projeto válido**: `projeto_id` deve existir

### 🔗 Relacionamentos

**Pertence a:**
- `projeto`: Projeto ao qual o cronograma pertence (one-to-one)
- `atualizado_por`: Usuário que fez última atualização

**Possui:**
- `historico[]`: Histórico de atualizações (ordenado por data DESC)

**Cascade Delete:**
- ⚠️ Deletado se o projeto for deletado
- ⚠️ Histórico deletado se o cronograma for deletado

### 💡 Casos de Uso

**Criar Cronograma:**
```json
{
  "projeto_id": 10,
  "percentual_conclusao": 0.00,
  "observacoes": "Projeto iniciado"
}
```

**Atualizar Progresso:**
```json
{
  "percentual_conclusao": 25.50,
  "observacoes": "Fase de planejamento concluída"
}
```

**Consultar Evolução:**
```sql
SELECT percentual_conclusao, observacoes, criado_em, criado_por_id
FROM cronogramas_historico
WHERE cronograma_id = 5
ORDER BY criado_em DESC
```

**Dashboard de Projetos:**
- Listar projetos com `percentual_conclusao < 100`
- Ordenar por `atualizado_em` (projetos sem atualização recente)
- Alertar projetos parados (sem atualização há X dias)

---

## 9. Despesa de Projeto

### 📝 Descrição
Gerencia despesas/pedidos de compra associados a projetos.

### 🔑 Campos

| Campo | Tipo | Obrigatório | Único | Descrição |
|-------|------|-------------|-------|-----------|
| `id` | Integer | Auto | Sim | Identificador único |
| `numero_despesa` | String(50) | Auto | Sim | Número único da despesa |
| `projeto_id` | Integer | Sim | Não | FK para Projeto |
| `fornecedor_id` | Integer | Sim | Não | FK para PessoaJuridica |
| `tecnico_responsavel_id` | Integer | Sim | Não | FK para Funcionario |
| `status` | Enum | Sim | Não | Status da despesa |
| `data_pedido` | Date | Sim | Não | Data do pedido |
| `previsao_entrega` | Date | Não | Não | Data prevista de entrega |
| `prazo_entrega_dias` | Integer | Não | Não | Prazo em dias |
| `condicao_pagamento` | String(100) | Não | Não | Ex: "30/60/90 dias" |
| `tipo_frete` | Enum | Não | Não | CIF ou FOB |
| `valor_frete` | Decimal(15,2) | Não | Não | Valor do frete |
| `observacoes` | Text | Não | Não | Observações |
| `criado_em` | DateTime | Auto | Não | Data/hora de criação |
| `atualizado_em` | DateTime | Auto | Não | Data/hora da última atualização |

### 📐 Regras de Negócio

#### Status da Despesa (Enum)

| Status | Descrição | Fluxo |
|--------|-----------|-------|
| **Rascunho** | Despesa em elaboração | Inicial |
| **Enviado** | Pedido enviado ao fornecedor | Aguardando confirmação |
| **Confirmado** | Fornecedor confirmou | Aguardando entrega |
| **Parcialmente Entregue** | Entrega parcial | Em andamento |
| **Entregue** | Totalmente entregue | Final (positivo) |
| **Cancelado** | Pedido cancelado | Final (negativo) |

#### Tipo de Frete (Enum)

| Tipo | Descrição |
|------|-----------|
| **CIF** | Custo, Seguro e Frete por conta do vendedor |
| **FOB** | Frete por conta do comprador |

#### Número da Despesa
- 🔢 Gerado automaticamente
- ✅ Único no sistema
- 📏 Formato definido pela aplicação
- 🔒 Não pode ser alterado

#### Validações
- ✅ **Projeto válido**: Deve existir
- ✅ **Fornecedor válido**: Deve ser Pessoa Jurídica tipo "Fornecedor"
- ✅ **Técnico válido**: Deve existir em Funcionário
- ✅ **Data válida**: `data_pedido` é obrigatória
- ✅ **Previsão lógica**: Se informada, deve ser >= `data_pedido`
- ✅ **Frete não negativo**: `valor_frete` >= 0.00
- ✅ **Prazo não negativo**: `prazo_entrega_dias` >= 0

#### Fluxo Típico
```
Rascunho → Enviado → Confirmado → Parcialmente Entregue → Entregue
                            ↓
                        Cancelado (se necessário)
```

#### Cálculos
- **Data prevista automática**: `data_pedido + prazo_entrega_dias`
- **Atraso**: `data_atual - previsao_entrega` (se positivo)

### 🔗 Relacionamentos

**Pertence a:**
- `projeto`: Projeto ao qual a despesa pertence
- `fornecedor`: Pessoa Jurídica fornecedora
- `tecnico_responsavel`: Funcionário responsável

**Cascade Delete:**
- ⚠️ Deletada se o projeto for deletado

### 💡 Casos de Uso

**Criar Despesa/Pedido:**
```json
{
  "projeto_id": 10,
  "fornecedor_id": 25,
  "tecnico_responsavel_id": 3,
  "status": "Rascunho",
  "data_pedido": "2026-02-16",
  "prazo_entrega_dias": 15,
  "condicao_pagamento": "30/60 dias",
  "tipo_frete": "CIF",
  "valor_frete": 150.00,
  "observacoes": "Pedido urgente"
}
```

**Atualizar Status:**
```json
{
  "status": "Confirmado",
  "previsao_entrega": "2026-03-03"
}
```

**Controle de Entregas:**
- Filtrar por `status != 'Entregue' AND status != 'Cancelado'`
- Ordenar por `previsao_entrega`
- Alertar pedidos atrasados: `previsao_entrega < data_atual`

**Relatório de Compras:**
- Agrupar por fornecedor
- Somar valores por período
- Analisar prazos médios de entrega

---

## 10. Relacionamentos entre Modelos

### 📊 Diagrama de Relacionamentos

```
User
  └─── (1:N) CronogramaHistorico [criado_por]
  └─── (1:N) Cronograma [atualizado_por]

PessoaJuridica
  ├─── (1:N) Contato [pessoa_juridica]
  ├─── (1:N) Projeto [cliente]
  ├─── (1:N) ProdutoServicoFornecedor [fornecedor]
  └─── (1:N) DespesaProjeto [fornecedor]

Contato
  └─── (1:N) Projeto [contato]

Projeto
  ├─── (1:N) Faturamento
  ├─── (1:N) DespesaProjeto
  └─── (1:1) Cronograma

Funcionario
  ├─── (1:N) Faturamento [tecnico]
  └─── (1:N) DespesaProjeto [tecnico_responsavel]

ProdutoServico
  ├─── (1:N) ProdutoServicoFornecedor
  └─── (1:N) ProdutoServicoHistoricoPreco

Cronograma
  └─── (1:N) CronogramaHistorico
```

### 🗑️ Políticas de Deleção (Cascade)

| Modelo Principal | Ao Deletar... | Deleta também... |
|-----------------|---------------|------------------|
| **PessoaJuridica** | Empresa | Contatos, Projetos (cliente) |
| **Contato** | Contato | Projetos vinculados |
| **Projeto** | Projeto | Faturamentos, Despesas, Cronograma |
| **Cronograma** | Cronograma | Histórico do cronograma |
| **ProdutoServico** | Produto/Serviço | Fornecedores vinculados, Histórico |

### 🔐 Restrições de Integridade

#### Não pode deletar se:
- **PessoaJuridica**: Se tiver projetos como fornecedora em despesas
- **Funcionario**: Se tiver faturamentos ou despesas vinculadas
- **User**: Se tiver cronogramas criados/atualizados (pode inativar)

### 📋 Regras de Consistência

#### Validações Cross-Model

1. **Contato deve pertencer ao Cliente do Projeto**
   ```python
   # Ao criar/atualizar projeto:
   contato = get_contato(contato_id)
   assert contato.pessoa_juridica_id == projeto.cliente_id
   ```

2. **Fornecedor em Despesa deve ser tipo "Fornecedor"**
   ```python
   fornecedor = get_pessoa_juridica(fornecedor_id)
   assert fornecedor.tipo in ["Fornecedor", "Ambos"]
   ```

3. **Soma de faturamentos não deve exceder valor de venda**
   ```python
   # Recomendado (não obrigatório):
   total_faturado = sum(f.valor_faturado for f in projeto.faturamentos)
   assert total_faturado <= projeto.valor_venda
   ```

4. **Cronograma único por projeto**
   ```python
   existing = get_cronograma_by_projeto(projeto_id)
   assert existing is None or existing.id == cronograma_id
   ```

### 🔄 Fluxo Completo de Negócio

**Exemplo: Ciclo de Vida de um Projeto**

1. **Cadastros Iniciais**
   ```
   Pessoa Jurídica (Cliente) → Contato → Usuário
   ```

2. **Criação do Projeto**
   ```
   Projeto (status: Orçando)
     ↓
   Vincula Cliente + Contato
   ```

3. **Orçamento**
   ```
   Define valor_orcado, valor_venda, prazo
     ↓
   Atualiza status: "Orçamento Enviado"
   ```

4. **Aprovação**
   ```
   Cliente aprova
     ↓
   Atualiza status: "Em Execução"
   Registra data_pedido_compra
     ↓
   Cria Cronograma (0%)
   ```

5. **Execução**
   ```
   Cria Despesas (pedidos a fornecedores)
     ↓
   Atualiza Cronograma periodicamente
     ↓
   Registra Faturamentos (parcelas)
   ```

6. **Conclusão**
   ```
   Cronograma → 100%
     ↓
   Todas despesas: "Entregue"
     ↓
   Atualiza status: "Concluído"
   ```

---

## 📊 Métricas e KPIs

### Métricas por Modelo

#### Projetos
- Total de projetos por status
- Taxa de conversão (Orçamento → Em Execução)
- Tempo médio por fase
- Margem de lucro média
- Projetos atrasados (cronograma < esperado)

#### Faturamentos
- Faturamento total por período
- Faturamento por técnico
- Faturamento por projeto
- % do valor de venda já faturado

#### Despesas
- Total de despesas por projeto
- Despesas por fornecedor
- Prazo médio de entrega
- Pedidos atrasados

#### Produtos/Serviços
- Itens mais cotados
- Variação de preço por item
- Fornecedores mais competitivos
- Impostos médios por categoria

### Dashboards Recomendados

1. **Dashboard Comercial**
   - Projetos em orçamento
   - Taxa de conversão
   - Pipeline de vendas

2. **Dashboard Operacional**
   - Projetos em execução
   - Cronograma de entregas
   - Despesas pendentes

3. **Dashboard Financeiro**
   - Faturamento realizado vs previsto
   - Margem de lucro por projeto
   - Contas a receber

4. **Dashboard Compras**
   - Pedidos em aberto
   - Análise de fornecedores
   - Histórico de preços

---

## 🔒 Segurança e Permissões

### Níveis de Acesso

#### Admin
- ✅ Todas as operações
- ✅ Gerenciar usuários
- ✅ Deletar registros
- ✅ Visualizar todos os dados

#### User
- ✅ Criar/editar projetos
- ✅ Criar/editar despesas
- ✅ Registrar faturamentos
- ✅ Atualizar cronogramas
- ❌ Deletar outros usuários
- ❌ Gerenciar permissões

### Auditoria

**Campos de Auditoria (presentes em todos os modelos):**
- `criado_em`: Quando foi criado
- `atualizado_em`: Última modificação
- `criado_por_id`: Quem criou (quando aplicável)
- `atualizado_por_id`: Quem atualizou (quando aplicável)

**Rastreabilidade:**
- Cronogramas: Rastreia quem fez cada atualização
- Histórico mantido indefinidamente
- Logs de acesso a serem implementados

---

## 📝 Convenções e Boas Práticas

### Nomenclatura

- **Tabelas**: Plural, snake_case (`projetos`, `pessoas_juridicas`)
- **Campos**: Snake_case (`valor_orcado`, `data_pedido`)
- **Enums**: PascalCase (`StatusProjeto`, `TipoProdutoServico`)
- **Relacionamentos**: Singular (`cliente`, `fornecedor`)

### Validações

- ✅ Sempre validar no schema (Pydantic)
- ✅ Validações de negócio nas rotas
- ✅ Constraints no banco (unique, not null)
- ✅ Mensagens de erro claras e em português

### Performance

- 📊 Índices em chaves estrangeiras
- 📊 Índices em campos de busca frequente (numero, sigla, cnpj)
- 🔍 Usar select relacionado para evitar N+1 queries
- 📦 Paginação em listagens grandes

### Manutenibilidade

- 📝 Documentar regras complexas
- 🧪 Testes para validações críticas
- 🔄 Migrações versionadas (Alembic)
- 📋 Changelog para alterações

---

**Última atualização:** 16 de Fevereiro de 2026

**Versão:** 1.0.0

**Nota:** Esta documentação deve ser atualizada sempre que houver mudanças nas regras de negócio ou na estrutura dos modelos.
