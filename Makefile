# ==============================================================================
# MAKEFILE - ERP SISTEMA
# ==============================================================================
# Comandos úteis para desenvolvimento e deploy
# Uso: make <comando>
# ==============================================================================

.PHONY: help install dev test clean docker build deploy

# Cores para output
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[1;33m
NC := \033[0m # No Color

# Configuração padrão
PYTHON := python
PIP := pip
NPM := npm

help: ## Mostra esta mensagem de ajuda
	@echo "$(BLUE)ERP Sistema - Comandos Disponíveis$(NC)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "$(GREEN)%-20s$(NC) %s\n", $$1, $$2}'

# ==============================================================================
# INSTALAÇÃO
# ==============================================================================

install: install-backend install-frontend ## Instala todas as dependências

install-backend: ## Instala dependências do backend
	@echo "$(YELLOW)Instalando dependências do backend...$(NC)"
	cd backend && $(PIP) install -r requirements.txt
	cd backend && $(PIP) install pytest pytest-cov black flake8 isort
	@echo "$(GREEN)Backend instalado!$(NC)"

install-frontend: ## Instala dependências do frontend
	@echo "$(YELLOW)Instalando dependências do frontend...$(NC)"
	cd frontend && $(NPM) install
	@echo "$(GREEN)Frontend instalado!$(NC)"

# ==============================================================================
# DESENVOLVIMENTO
# ==============================================================================

dev: ## Inicia ambiente de desenvolvimento (backend + frontend)
	@echo "$(YELLOW)Iniciando ambiente de desenvolvimento...$(NC)"
	@$(MAKE) dev-backend &
	@$(MAKE) dev-frontend

dev-backend: ## Inicia apenas o backend
	@echo "$(YELLOW)Iniciando backend...$(NC)"
	cd backend && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

dev-frontend: ## Inicia apenas o frontend
	@echo "$(YELLOW)Iniciando frontend...$(NC)"
	cd frontend && $(NPM) run dev

# ==============================================================================
# DATABASE
# ==============================================================================

db-migrate: ## Executa migrações do banco de dados
	@echo "$(YELLOW)Executando migrações...$(NC)"
	cd backend && python -m alembic upgrade head
	@echo "$(GREEN)Migrações concluídas!$(NC)"

db-revision: ## Cria nova migração (use: make db-revision MSG="mensagem")
	@echo "$(YELLOW)Criando nova migração...$(NC)"
	cd backend && python -m alembic revision --autogenerate -m "$(MSG)"

db-downgrade: ## Reverte última migração
	@echo "$(YELLOW)Revertendo migração...$(NC)"
	cd backend && python -m alembic downgrade -1

db-seed: ## Popula banco com dados iniciais
	@echo "$(YELLOW)Criando usuários iniciais...$(NC)"
	cd backend && python seed_users.py
	@echo "$(GREEN)Seed concluído!$(NC)"

# ==============================================================================
# TESTES
# ==============================================================================

test: test-backend ## Executa todos os testes

test-backend: ## Executa testes do backend
	@echo "$(YELLOW)Executando testes do backend...$(NC)"
	cd backend && pytest -v

test-backend-cov: ## Executa testes do backend com coverage
	@echo "$(YELLOW)Executando testes com coverage...$(NC)"
	cd backend && pytest --cov=app --cov-report=html --cov-report=term

test-frontend: ## Executa testes do frontend
	@echo "$(YELLOW)Executando testes do frontend...$(NC)"
	cd frontend && $(NPM) run test

# ==============================================================================
# LINTING & FORMATAÇÃO
# ==============================================================================

lint: lint-backend lint-frontend ## Executa linting em todo código

lint-backend: ## Executa linting no backend
	@echo "$(YELLOW)Linting backend...$(NC)"
	cd backend && flake8 .
	cd backend && isort --check-only .

lint-frontend: ## Executa linting no frontend
	@echo "$(YELLOW)Linting frontend...$(NC)"
	cd frontend && $(NPM) run lint

format: format-backend format-frontend ## Formata todo código

format-backend: ## Formata código do backend
	@echo "$(YELLOW)Formatando backend...$(NC)"
	cd backend && black .
	cd backend && isort .
	@echo "$(GREEN)Backend formatado!$(NC)"

format-frontend: ## Formata código do frontend
	@echo "$(YELLOW)Formatando frontend...$(NC)"
	cd frontend && npx prettier --write "src/**/*.{ts,tsx,js,jsx}"
	@echo "$(GREEN)Frontend formatado!$(NC)"

# ==============================================================================
# BUILD
# ==============================================================================

build: build-backend build-frontend ## Build de produção

build-backend: ## Build do backend
	@echo "$(YELLOW)Building backend...$(NC)"
	cd backend && $(PIP) install -r requirements.txt

build-frontend: ## Build do frontend
	@echo "$(YELLOW)Building frontend...$(NC)"
	cd frontend && $(NPM) run build
	@echo "$(GREEN)Frontend build concluído!$(NC)"

# ==============================================================================
# DOCKER
# ==============================================================================

docker-build: ## Build das imagens Docker
	@echo "$(YELLOW)Building Docker images...$(NC)"
	docker-compose build
	@echo "$(GREEN)Docker images criadas!$(NC)"

docker-up: ## Inicia containers Docker
	@echo "$(YELLOW)Iniciando containers...$(NC)"
	docker-compose up -d
	@echo "$(GREEN)Containers iniciados!$(NC)"

docker-down: ## Para containers Docker
	@echo "$(YELLOW)Parando containers...$(NC)"
	docker-compose down
	@echo "$(GREEN)Containers parados!$(NC)"

docker-logs: ## Mostra logs dos containers
	docker-compose logs -f

docker-rebuild: ## Rebuild e restart dos containers
	@echo "$(YELLOW)Rebuilding containers...$(NC)"
	docker-compose down
	docker-compose build --no-cache
	docker-compose up -d
	@echo "$(GREEN)Containers reconstruídos!$(NC)"

# ==============================================================================
# LIMPEZA
# ==============================================================================

clean: ## Remove arquivos temporários e cache
	@echo "$(YELLOW)Limpando arquivos temporários...$(NC)"
	find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	find . -type f -name "*.pyc" -delete
	find . -type f -name "*.pyo" -delete
	find . -type f -name "*.db" -delete
	find . -type f -name "*.sqlite" -delete
	rm -rf backend/.pytest_cache
	rm -rf backend/.coverage
	rm -rf backend/htmlcov
	rm -rf backend/dist
	rm -rf backend/build
	rm -rf backend/*.egg-info
	rm -rf frontend/dist
	rm -rf frontend/build
	rm -rf frontend/.vite
	@echo "$(GREEN)Limpeza concluída!$(NC)"

clean-all: clean ## Remove todas dependências e builds
	@echo "$(YELLOW)Removendo todas dependências...$(NC)"
	rm -rf backend/.venv
	rm -rf backend/venv
	rm -rf frontend/node_modules
	@echo "$(GREEN)Tudo limpo!$(NC)"

# ==============================================================================
# UTILIDADES
# ==============================================================================

secret-key: ## Gera uma nova SECRET_KEY
	@echo "$(YELLOW)Gerando SECRET_KEY...$(NC)"
	cd backend && python generate_secret_key.py

check: ## Verifica configuração do projeto
	@echo "$(YELLOW)Verificando configuração...$(NC)"
	@echo "Python: $(shell python --version)"
	@echo "Node: $(shell node --version)"
	@echo "NPM: $(shell npm --version)"
	@echo "Docker: $(shell docker --version)"
	@echo "$(GREEN)Verificação concluída!$(NC)"

logs-backend: ## Mostra logs do backend
	tail -f backend/logs/app.log

logs-errors: ## Mostra logs de erro
	tail -f backend/logs/errors.log
