# Versioning

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-02-16

### Added

- Sistema completo de autenticação JWT
- Gestão de Pessoas Jurídicas (CRUD completo)
- Gestão de Contatos vinculados a empresas
- Gestão de Funcionários
- Gestão de Projetos com cronogramas
- Sistema de Faturamento
- Produtos e Serviços catalogados
- Despesas de Projetos categorizadas
- Logging estruturado com rotação de arquivos
- Health check endpoint para monitoramento
- Testes automatizados (Backend)
- Docker e Docker Compose configurados
- CI/CD com GitHub Actions
- Linting e formatação (Black, Flake8, ESLint, Prettier)
- Makefile com comandos úteis
- Documentação completa

### Security

- Senhas hasheadas com Argon2
- JWT tokens com expiração configurável
- CORS configurável por ambiente
- Validação de inputs com Pydantic

## [Unreleased]

### Planned

- Testes para frontend (Jest + Testing Library)
- Sistema de notificações
- Relatórios em PDF
- Exportação de dados (Excel/CSV)
- Dashboard com gráficos
- Backup automático
- Rate limiting
- WebSocket para atualizações em tempo real
