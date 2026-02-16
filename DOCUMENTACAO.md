# 📚 Índice de Documentação - ERP Sistema TAKT

Central de documentação do projeto. Encontre rapidamente o guia que você precisa.

---

## 🚀 Começando

### Para Novos Desenvolvedores

1. **[⚡ Quick Start](./QUICK_START.md)** ← **COMECE AQUI!**
   - Execute a aplicação em 5 minutos
   - Comandos essenciais
   - Login e acesso rápido

2. **[📖 Guia de Desenvolvimento Completo](./GUIA_DESENVOLVIMENTO.md)**
   - Configuração inicial detalhada
   - Pré-requisitos e instalação
   - Solução de problemas
   - Boas práticas

3. **[🪟 Comandos Windows/PowerShell](./COMANDOS_WINDOWS.md)**
   - Todos os comandos para Windows
   - Equivalentes ao Makefile
   - Scripts PowerShell prontos

---

## 📋 Documentação do Projeto

### Informações Gerais

- **[README.md](./README.md)**
  - Visão geral do projeto
  - Recursos principais
  - Tecnologias utilizadas
  - Estrutura do projeto

- **[CHANGELOG.md](./CHANGELOG.md)**
  - Histórico de versões
  - Notas de release
  - Mudanças e melhorias

- **[LICENSE](./LICENSE)**
  - Licença MIT
  - Termos de uso

### Arquitetura e Regras

- **[📋 Regras de Negócio](./REGRAS_NEGOCIO.md)**
  - Documentação de todos os modelos do backend
  - Validações e constraints
  - Workflows e status
  - Relacionamentos entre entidades
  - Casos de uso e exemplos

### Contribuição

- **[CONTRIBUTING.md](./CONTRIBUTING.md)**
  - Como contribuir
  - Padrões de código
  - Workflow de desenvolvimento
  - Convenções de commit

---

## 🎯 Guias por Tarefa

### Executar a Aplicação

| Preciso... | Documento |
| ---------- | --------- |
| Rodar o projeto AGORA | [Quick Start](./QUICK_START.md) |
| Configurar ambiente pela primeira vez | [Guia de Desenvolvimento - Configuração Inicial](./GUIA_DESENVOLVIMENTO.md#configuração-inicial) |
| Ver todos os comandos Windows | [Comandos Windows](./COMANDOS_WINDOWS.md) |
| Usar Docker | [Guia de Desenvolvimento - Docker](./GUIA_DESENVOLVIMENTO.md#-docker-opcional) |

### Desenvolvimento

| Preciso... | Documento |
| ---------- | --------- |
| Formatar código | [Comandos Windows - Formatação](./COMANDOS_WINDOWS.md#-formatação-e-linting) |
| Executar testes | [Comandos Windows - Testes](./COMANDOS_WINDOWS.md#-testes) |
| Criar migração do banco | [Comandos Windows - Banco de Dados](./COMANDOS_WINDOWS.md#-banco-de-dados) |
| Ver logs em tempo real | [Comandos Windows - Monitoramento](./COMANDOS_WINDOWS.md#-monitoramento) |
| Limpar cache/build | [Comandos Windows - Limpeza](./COMANDOS_WINDOWS.md#-limpeza) |

### Problemas

| Problema | Solução |
| -------- | ------- |
| Erro de conexão com banco | [Guia de Desenvolvimento - Problemas](./GUIA_DESENVOLVIMENTO.md#-solução-de-problemas) |
| Porta 8000 em uso | [Quick Start - Problemas Comuns](./QUICK_START.md#-problemas-comuns) |
| Ambiente virtual não ativa | [Comandos Windows - Ambiente Virtual](./COMANDOS_WINDOWS.md#-ambiente-virtual) |
| Frontend não conecta | [Guia de Desenvolvimento - Problemas](./GUIA_DESENVOLVIMENTO.md#frontend-não-conecta-ao-backend) |

### Contribuindo

| Preciso... | Documento |
| ---------- | --------- |
| Enviar uma contribuição | [CONTRIBUTING.md](./CONTRIBUTING.md) |
| Entender padrões de código | [CONTRIBUTING.md - Padrões](./CONTRIBUTING.md) |
| Criar um commit | [CONTRIBUTING.md - Commits](./CONTRIBUTING.md) |

### Entendendo o Sistema

| Preciso... | Documento |
| ---------- | --------- |
| Entender regras de validação | [Regras de Negócio](./REGRAS_NEGOCIO.md) |
| Ver estrutura dos modelos | [Regras de Negócio](./REGRAS_NEGOCIO.md) |
| Entender workflows (status) | [Regras de Negócio - Workflows](./REGRAS_NEGOCIO.md) |
| Ver relacionamentos entre tabelas | [Regras de Negócio - Relacionamentos](./REGRAS_NEGOCIO.md#10-relacionamentos-entre-modelos) |

---

## 🔍 Busca Rápida

### Autenticação e Segurança

- **[Credenciais padrão](./GUIA_DESENVOLVIMENTO.md#6-crie-usuários-de-teste)**
  - Admin: `admin` / `admin123`
  - User: `user` / `user123`

- **[Gerar SECRET_KEY](./COMANDOS_WINDOWS.md#gerar-secret_key)**

  ```powershell
  python -c "import secrets; print(secrets.token_urlsafe(64))"
  ```

### URLs Importantes

| Serviço | URL | Documento |
| ------- | --- | --------- |
| Frontend | <http://localhost:5173> | [Quick Start](./QUICK_START.md) |
| Backend API | <http://localhost:8000> | [Quick Start](./QUICK_START.md) |
| Swagger Docs | <http://localhost:8000/api/docs> | [Guia](./GUIA_DESENVOLVIMENTO.md#acessar-a-aplicação) |
| Health Check | <http://localhost:8000/health> | [Guia](./GUIA_DESENVOLVIMENTO.md#acessar-a-aplicação) |

### Configuração

- **[Banco de Dados PostgreSQL](./GUIA_DESENVOLVIMENTO.md#2-configure-o-banco-de-dados-postgresql)**
- **[Variáveis de Ambiente (.env)](./GUIA_DESENVOLVIMENTO.md#4-configure-as-variáveis-de-ambiente)**
- **[Migrações](./COMANDOS_WINDOWS.md#-banco-de-dados)**

### Comandos Mais Usados

```powershell
# Ativar ambiente virtual
..\\.venv\Scripts\Activate.ps1

# Rodar backend
uvicorn app.main:app --reload

# Rodar frontend
npm run dev

# Executar testes
pytest tests/ -v

# Formatar código
black app tests
```

**[Ver todos os comandos →](./COMANDOS_WINDOWS.md)**

---

## 📱 Por Plataforma

### Windows

- **[Quick Start](./QUICK_START.md)** - Funciona em Windows
- **[Comandos Windows](./COMANDOS_WINDOWS.md)** - Específico para PowerShell
- **[Guia de Desenvolvimento](./GUIA_DESENVOLVIMENTO.md)** - Multiplataforma com exemplos Windows

### Linux/Mac

- **[Quick Start](./QUICK_START.md)** - Funciona em Linux/Mac
- **[Makefile](./Makefile)** - Use o Makefile original
- **[Guia de Desenvolvimento](./GUIA_DESENVOLVIMENTO.md)** - Instruções adaptáveis

---

## 🎓 Recursos de Aprendizado

### Tecnologias do Backend

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)
- [Alembic Documentation](https://alembic.sqlalchemy.org/)
- [Pydantic Documentation](https://docs.pydantic.dev/)
- [pytest Documentation](https://docs.pytest.org/)

### Tecnologias do Frontend

- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Vite Documentation](https://vitejs.dev/)
- [Material-UI Documentation](https://mui.com/)
- [React Router Documentation](https://reactrouter.com/)

### Ferramentas

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Docker Documentation](https://docs.docker.com/)
- [Git Documentation](https://git-scm.com/doc)

---

## 🆘 Ajuda

### Não encontrou o que procura?

1. Use o Ctrl+F nesta página para buscar
2. Consulte o [Guia de Desenvolvimento](./GUIA_DESENVOLVIMENTO.md) completo
3. Verifique a seção de [Solução de Problemas](./GUIA_DESENVOLVIMENTO.md#-solução-de-problemas)
4. Veja os [Comandos Windows](./COMANDOS_WINDOWS.md) para referência de comandos
5. Abra uma issue no repositório

### Fluxo Recomendado para Iniciantes

```text
1. Leia o README.md (5 min)
   ↓
2. Siga o Quick Start (5 min)
   ↓
3. Execute a aplicação (2 min)
   ↓
4. Explore o Guia de Desenvolvimento (conforme necessário)
   ↓
5. Use Comandos Windows como referência
```

---

## 📝 Contribuindo com a Documentação

Encontrou algum erro ou quer melhorar a documentação?

1. Leia o [CONTRIBUTING.md](./CONTRIBUTING.md)
2. Faça um fork do projeto
3. Crie uma branch para sua contribuição
4. Envie um Pull Request

---

**Última atualização:** 16 de Fevereiro de 2026

**Mantido por:** Equipe de Desenvolvimento ERP Sistema TAKT
