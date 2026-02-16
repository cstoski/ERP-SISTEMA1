"""Testes para modelos"""
import pytest
from app.models.user import User


class TestUserModel:
    """Testes do modelo User"""

    def test_create_user(self, db_session):
        """Teste de criação de usuário"""
        user = User(
            username="testuser",
            email="test@test.com",
            hashed_password="hashed",
            is_active=True,
            role="user"
        )
        db_session.add(user)
        db_session.commit()
        
        assert user.id is not None
        assert user.username == "testuser"
        assert user.email == "test@test.com"

    def test_user_unique_email(self, db_session):
        """Teste de email único"""
        # TODO: Implementar teste de constraint de email único
        pass

    def test_user_unique_username(self, db_session):
        """Teste de username único"""
        # TODO: Implementar
        pass


class TestPessoaJuridicaModel:
    """Testes do modelo PessoaJuridica"""

    def test_create_pessoa_juridica(self, db_session):
        """Teste de criação de pessoa jurídica"""
        # TODO: Implementar
        pass

    def test_cnpj_validation(self, db_session):
        """Teste de validação de CNPJ"""
        # TODO: Implementar
        pass
