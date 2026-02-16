from fastapi import APIRouter
import socket
import psutil
from ..config import settings
from ..database import engine
from sqlalchemy import text

router = APIRouter(prefix="/status", tags=["status"])

@router.get("/info")
def get_status_info():
    # Testa conexão com banco
    db_status = "ok"
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
    except Exception:
        db_status = "erro"

    # Nome do host
    hostname = socket.gethostname()
    # IP do host
    try:
        ip = socket.gethostbyname(hostname)
    except Exception:
        ip = "?"

    # Quantidade de processos uvicorn/fastapi rodando
    server_count = 0
    for proc in psutil.process_iter(['name', 'cmdline']):
        try:
            if proc.info['name'] and (
                'uvicorn' in proc.info['name'].lower() or
                (proc.info['cmdline'] and any('uvicorn' in c for c in proc.info['cmdline']))
            ):
                server_count += 1
        except Exception:
            continue

    return {
        "db_status": db_status,
        "hostname": hostname,
        "ip": ip,
        "server_count": server_count
    }
