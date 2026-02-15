"""
Script para testar rotas com usuário 'user'
"""
import requests
import json

# URL da API
BASE_URL = "http://localhost:8000"

print("=== TESTE COM USUÁRIO 'user' ===\n")

# Fazer login com user
print("1. Fazendo login com user...")
login_response = requests.post(
    f"{BASE_URL}/api/auth/token",
    json={"username": "user", "password": "user123"}
)

print(f"Status: {login_response.status_code}")
if login_response.status_code == 200:
    data = login_response.json()
    token = data.get("access_token")
    print(f"✓ Token obtido: {token[:50]}...\n")
    
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    # Testar funcionários
    print("2. GET /api/funcionarios/")
    resp = requests.get(f"{BASE_URL}/api/funcionarios/", headers=headers)
    print(f"   Status: {resp.status_code}")
    print(f"   Response: {resp.json()}\n")
    
    # Testar projetos
    print("3. GET /api/projetos/")
    resp = requests.get(f"{BASE_URL}/api/projetos/", headers=headers)
    print(f"   Status: {resp.status_code}")
    print(f"   Response: {resp.json()}\n")
    
    # Testar faturamentos
    print("4. GET /api/faturamentos/")
    resp = requests.get(f"{BASE_URL}/api/faturamentos/", headers=headers)
    print(f"   Status: {resp.status_code}")
    print(f"   Response: {resp.json()}\n")
    
    # Verificar rotas
    print("5. GET /api/ (raiz)")
    resp = requests.get(f"{BASE_URL}/api/", headers=headers)
    print(f"   Status: {resp.status_code}")
    print(f"   Response: {resp.json()}\n")
    
else:
    print(f"✗ Erro ao fazer login: {login_response.json()}")
