# Backend Tests

Execute os testes com pytest:

```bash
# Todos os testes
pytest

# Com coverage
pytest --cov=app --cov-report=html

# Testes específicos
pytest tests/test_auth.py

# Testes com marcadores
pytest -m unit
pytest -m integration
```

## Estrutura

- `conftest.py` - Fixtures e configurações
- `test_auth.py` - Testes de autenticação
- `test_models.py` - Testes de modelos
- `test_main.py` - Testes gerais
