"""
Script para testar requisição GET com autenticação
"""
import requests
import json

# URL da API
BASE_URL = "http://localhost:8000"

# Primeira, fazer login
print("=== TESTE DE AUTENTICAÇÃO ===\n")
print("1. Fazendo login...")

login_response = requests.post(
    f"{BASE_URL}/api/auth/token",
    json={"username": "admin", "password": "admin123"}
)

print(f"Status: {login_response.status_code}")
print(f"Response: {login_response.json()}")

if login_response.status_code == 200:
    token = login_response.json().get("access_token")
    print(f"\n✓ Token obtido: {token[:50]}...\n")
    
    # Agora fazer requisição autenticada para funcionários
    print("2. Buscando funcionários com autenticação...")
    
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    funcionarios_response = requests.get(
        f"{BASE_URL}/api/funcionarios/",
        headers=headers
    )
    
    print(f"Status: {funcionarios_response.status_code}")
    print(f"Response: {funcionarios_response.json()}")
    
    if funcionarios_response.status_code == 200:
        print(f"\n✓ Funcionários retornados: {len(funcionarios_response.json())}")
    else:
        print(f"\n✗ Erro ao obter funcionários")
        
    # Teste projetos
    print("\n3. Buscando projetos com autenticação...")
    projetos_response = requests.get(
        f"{BASE_URL}/api/projetos/",
        headers=headers
    )
    
    print(f"Status: {projetos_response.status_code}")
    print(f"Response: {projetos_response.json()}")
    
    # Teste faturamentos
    print("\n4. Buscando faturamentos com autenticação...")
    faturamentos_response = requests.get(
        f"{BASE_URL}/api/faturamentos/",
        headers=headers
    )
    
    print(f"Status: {faturamentos_response.status_code}")
    print(f"Response: {faturamentos_response.json()}")

else:
    print("✗ Falha ao fazer login")
