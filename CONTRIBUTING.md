# CONTRIBUTING.md

## Como Contribuir

Obrigado por considerar contribuir para o ERP Sistema!

### Configurando o Ambiente

1. Fork o repositório
2. Clone seu fork:

   ```bash
   git clone https://github.com/seu-usuario/ERP-SISTEMA.git
   cd ERP-SISTEMA
   ```

3. Instale as dependências:

   ```bash
   make install
   # ou manualmente:
   cd backend && pip install -r requirements.txt
   cd ../frontend && npm install
   ```

### Padrões de Código

#### Backend (Python)

- Use **Black** para formatação (max 100 chars/linha)
- Use **Flake8** para linting
- Use **isort** para ordenar imports
- Execute antes de commitar:

  ```bash
  make format-backend
  make lint-backend
  ```

#### Frontend (TypeScript/React)

- Use **Prettier** para formatação
- Use **ESLint** para linting
- Execute antes de commitar:

  ```bash
  make format-frontend
  make lint-frontend
  ```

### Workflow de Desenvolvimento

1. Crie uma branch para sua feature:

   ```bash
   git checkout -b feature/minha-feature
   ```

2. Faça suas alterações

3. Execute os testes:

   ```bash
   make test
   ```

4. Commit suas mudanças:

   ```bash
   git commit -m "feat: adiciona nova funcionalidade X"
   ```

5. Push para seu fork:

   ```bash
   git push origin feature/minha-feature
   ```

6. Abra um Pull Request

### Mensagens de Commit

Seguimos o padrão [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` nova funcionalidade
- `fix:` correção de bug
- `docs:` mudanças na documentação
- `style:` formatação, falta de ponto-e-vírgula, etc
- `refactor:` refatoração de código
- `test:` adicionar ou corrigir testes
- `chore:` tarefas de manutenção

### Testes

- Escreva testes para novas funcionalidades
- Backend: pytest com cobertura mínima de 80%
- Execute: `make test-backend-cov`

### Code Review

Todo PR passa por code review. Certifique-se de:

- [ ] Código formatado corretamente
- [ ] Testes passando
- [ ] Documentação atualizada
- [ ] Sem conflitos com main

Obrigado! 🙏
