#!/usr/bin/env python
"""
Script para alternar entre ambientes (development/production)
e visualizar a configuração atual do banco de dados.

Uso:
    python switch_environment.py status              # Ver configuração atual
    python switch_environment.py dev                 # Alternar para desenvolvimento
    python switch_environment.py prod                # Alternar para produção
    python switch_environment.py set DATABASE_URL    # Definir URL customizada
"""

import sys
import os
from pathlib import Path

def read_env_file():
    """Lê o arquivo .env e retorna um dicionário com as variáveis"""
    env_file = Path(".env")
    if not env_file.exists():
        return {}
    
    env_vars = {}
    with open(env_file, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                key, value = line.split('=', 1)
                env_vars[key.strip()] = value.strip()
    return env_vars

def write_env_file(env_vars):
    """Escreve as variáveis no arquivo .env preservando comentários"""
    env_file = Path(".env")
    
    # Lê o arquivo original preservando comentários
    lines = []
    if env_file.exists():
        with open(env_file, 'r', encoding='utf-8') as f:
            lines = f.readlines()
    
    # Atualiza as linhas com as novas variáveis
    updated_lines = []
    updated_keys = set()
    
    for line in lines:
        stripped = line.strip()
        if stripped and not stripped.startswith('#') and '=' in stripped:
            key = stripped.split('=', 1)[0].strip()
            if key in env_vars:
                updated_lines.append(f"{key}={env_vars[key]}\n")
                updated_keys.add(key)
            else:
                updated_lines.append(line)
        else:
            updated_lines.append(line)
    
    # Adiciona novas variáveis que não existiam
    for key, value in env_vars.items():
        if key not in updated_keys:
            updated_lines.append(f"{key}={value}\n")
    
    # Escreve o arquivo
    with open(env_file, 'w', encoding='utf-8') as f:
        f.writelines(updated_lines)

def show_status():
    """Mostra o status atual da configuração"""
    env_vars = read_env_file()
    
    if not env_vars:
        print("❌ Arquivo .env não encontrado!")
        print("💡 Copie o arquivo .env.example para .env e configure as variáveis.")
        return
    
    environment = env_vars.get('ENVIRONMENT', 'development')
    db_url = env_vars.get('DATABASE_URL', '')
    db_url_dev = env_vars.get('DATABASE_URL_DEV', 'sqlite:///./erp_dev.db')
    db_url_prod = env_vars.get('DATABASE_URL_PROD', 'sqlite:///./erp_prod.db')
    
    print("=" * 70)
    print("📊 CONFIGURAÇÃO ATUAL DO AMBIENTE")
    print("=" * 70)
    print(f"🔧 Ambiente: {environment.upper()}")
    print(f"\n📁 URLs de Banco Configuradas:")
    print(f"   • Development: {db_url_dev}")
    print(f"   • Production:  {db_url_prod}")
    
    if db_url:
        print(f"\n⚠️  Override Manual Ativo:")
        print(f"   • DATABASE_URL: {db_url}")
        print(f"   • A aplicação usará esta URL ignorando DEV/PROD")
    else:
        print(f"\n✅ Banco Ativo ({environment}):")
        active_url = db_url_prod if environment.lower() == 'production' else db_url_dev
        print(f"   • {active_url}")
    
    print("=" * 70)

def switch_to_dev():
    """Alterna para ambiente de desenvolvimento"""
    env_vars = read_env_file()
    
    if not env_vars:
        print("❌ Arquivo .env não encontrado! Copie .env.example para .env primeiro.")
        return
    
    env_vars['ENVIRONMENT'] = 'development'
    # Remove override manual se existir
    if 'DATABASE_URL' in env_vars and env_vars['DATABASE_URL']:
        env_vars['DATABASE_URL'] = ''
    
    write_env_file(env_vars)
    print("✅ Ambiente alterado para DEVELOPMENT")
    print(f"📁 Banco de dados: {env_vars.get('DATABASE_URL_DEV', 'sqlite:///./erp_dev.db')}")
    print("⚠️  Reinicie o servidor backend para aplicar as mudanças!")

def switch_to_prod():
    """Alterna para ambiente de produção"""
    env_vars = read_env_file()
    
    if not env_vars:
        print("❌ Arquivo .env não encontrado! Copie .env.example para .env primeiro.")
        return
    
    env_vars['ENVIRONMENT'] = 'production'
    # Remove override manual se existir
    if 'DATABASE_URL' in env_vars and env_vars['DATABASE_URL']:
        env_vars['DATABASE_URL'] = ''
    
    write_env_file(env_vars)
    print("✅ Ambiente alterado para PRODUCTION")
    print(f"📁 Banco de dados: {env_vars.get('DATABASE_URL_PROD', 'sqlite:///./erp_prod.db')}")
    print("⚠️  Reinicie o servidor backend para aplicar as mudanças!")
    print("⚠️  ATENÇÃO: Certifique-se de que o banco de produção está configurado corretamente!")

def set_custom_url(url):
    """Define uma URL customizada de banco de dados"""
    env_vars = read_env_file()
    
    if not env_vars:
        print("❌ Arquivo .env não encontrado! Copie .env.example para .env primeiro.")
        return
    
    env_vars['DATABASE_URL'] = url
    write_env_file(env_vars)
    print(f"✅ DATABASE_URL customizada definida: {url}")
    print("⚠️  Esta URL será usada independente do ambiente (DEV/PROD)")
    print("⚠️  Reinicie o servidor backend para aplicar as mudanças!")

def show_help():
    """Mostra a ajuda do script"""
    print("""
🔄 Script de Alternância de Ambiente - ERP Sistema
═══════════════════════════════════════════════════════════════════════

USO:
    python switch_environment.py <comando> [argumentos]

COMANDOS:
    status              Ver configuração atual do banco e ambiente
    dev                 Alternar para ambiente de DESENVOLVIMENTO
    prod                Alternar para ambiente de PRODUÇÃO
    set <URL>           Definir URL customizada do banco (override manual)
    help                Mostrar esta ajuda

EXEMPLOS:
    python switch_environment.py status
    python switch_environment.py dev
    python switch_environment.py prod
    python switch_environment.py set "postgresql://user:pass@localhost/db"

ARQUITETURA:
    • ENVIRONMENT: Define o ambiente (development/production)
    • DATABASE_URL_DEV: URL do banco de desenvolvimento
    • DATABASE_URL_PROD: URL do banco de produção
    • DATABASE_URL: Override manual (ignora DEV/PROD se definido)

OBSERVAÇÕES:
    ⚠️  Sempre reinicie o servidor backend após alternar o ambiente
    ⚠️  O override manual (set) tem prioridade sobre DEV/PROD
    ⚠️  Para remover override, use: dev ou prod
    """)

def main():
    if len(sys.argv) < 2:
        show_status()
        return
    
    command = sys.argv[1].lower()
    
    if command == 'status':
        show_status()
    elif command == 'dev' or command == 'development':
        switch_to_dev()
    elif command == 'prod' or command == 'production':
        switch_to_prod()
    elif command == 'set' and len(sys.argv) >= 3:
        url = sys.argv[2]
        set_custom_url(url)
    elif command == 'help' or command == '--help' or command == '-h':
        show_help()
    else:
        print(f"❌ Comando desconhecido: {command}")
        print("💡 Use 'python switch_environment.py help' para ver os comandos disponíveis")

if __name__ == "__main__":
    main()
