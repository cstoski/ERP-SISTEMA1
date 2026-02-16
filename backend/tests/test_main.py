"""Testes unitários"""


class TestHealthCheck:
    """Testes do health check"""

    def test_health_endpoint(self, client):
        """Teste do endpoint de health check"""
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert "status" in data
        assert data["status"] == "healthy"


class TestRootEndpoint:
    """Testes do endpoint raiz"""

    def test_root_endpoint(self, client):
        """Teste do endpoint raiz"""
        response = client.get("/")
        assert response.status_code == 200
