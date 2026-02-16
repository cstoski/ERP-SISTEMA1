#!/usr/bin/env python
"""
Script para executar o servidor em modo produção
"""
import sys
import os

# Adiciona o diretório atual ao Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import uvicorn

if __name__ == "__main__":
    print("🚀 Iniciando servidor em modo PRODUÇÃO...")
    print("📝 Configurações:")
    print("   - Host: 0.0.0.0")
    print("   - Porta: 8000")
    print("   - Workers: 4")
    print("   - Reload: Desabilitado")
    print("   - Docs: Desabilitados\n")
    
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        workers=4,
        reload=False,
        log_level="info",
        access_log=True,
    )
