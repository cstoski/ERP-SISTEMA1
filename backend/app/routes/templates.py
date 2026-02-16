from fastapi import APIRouter, File, HTTPException, UploadFile
from fastapi.responses import FileResponse
from pathlib import Path
from typing import Dict, Optional
from datetime import datetime

from ..config import settings
router = APIRouter()

TEMPLATE_FILES = {
    "proposta_completa": "TCxxxxxx-0.docx",
    "proposta_simplificada": "TCxxxxxx-0_Simplificada.docx",
    "relatorio_visita": "Relatorio de Visita_V0.docx",
    "planilha_proposta": "TCxxxxxx-0.xlsm",
}


def _get_templates_dir() -> Path:
    if not settings.LOCAL_TEMPLATES_PATH:
        raise HTTPException(status_code=400, detail="Caminho de templates nao configurado")
    base_dir = Path(settings.LOCAL_TEMPLATES_PATH)
    base_dir.mkdir(parents=True, exist_ok=True)
    return base_dir


def _file_info(path: Path) -> Dict[str, Optional[str]]:
    if not path.exists():
        return {"exists": False, "updated_at": None}
    updated_at = datetime.fromtimestamp(path.stat().st_mtime).isoformat()
    return {"exists": True, "updated_at": updated_at}


@router.get("/")
def list_templates():
    base_dir = _get_templates_dir()
    status = {}
    for key, filename in TEMPLATE_FILES.items():
        status[key] = {
            "filename": filename,
            **_file_info(base_dir / filename),
        }
    return {
        "path": str(base_dir),
        "files": status,
    }


@router.post("/")
def upload_templates(
    proposta_completa: Optional[UploadFile] = File(default=None),
    proposta_simplificada: Optional[UploadFile] = File(default=None),
    relatorio_visita: Optional[UploadFile] = File(default=None),
    planilha_proposta: Optional[UploadFile] = File(default=None),
):
    base_dir = _get_templates_dir()

    uploads = {
        "proposta_completa": proposta_completa,
        "proposta_simplificada": proposta_simplificada,
        "relatorio_visita": relatorio_visita,
        "planilha_proposta": planilha_proposta,
    }

    saved = []
    for key, upload in uploads.items():
        if not upload:
            continue
        filename = TEMPLATE_FILES[key]
        target_path = base_dir / filename
        content = upload.file.read()
        if not content:
            raise HTTPException(status_code=400, detail=f"Arquivo vazio: {upload.filename}")
        target_path.write_bytes(content)
        saved.append(filename)

    if not saved:
        raise HTTPException(status_code=400, detail="Nenhum arquivo enviado")

    return {"message": "Templates atualizados com sucesso", "saved": saved}


@router.get("/{template_key}")
def download_template(template_key: str):
    if template_key not in TEMPLATE_FILES:
        raise HTTPException(status_code=404, detail="Template nao encontrado")
    base_dir = _get_templates_dir()
    filename = TEMPLATE_FILES[template_key]
    file_path = base_dir / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Arquivo nao encontrado")
    return FileResponse(path=str(file_path), filename=filename)
