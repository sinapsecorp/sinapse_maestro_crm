from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
import uuid
from src.controllers import auth_controller, user_controller, lead_controller, area_of_expertise_controller, campaign_controller, channel_controller, analytics_controller
from src.controllers import marketing_controller, template_controller

app = FastAPI(
    title="Sinapse Maestro CRM",
    description="API para o sistema de gerenciamento de relacionamento com cliente.",
    version="0.1.0"
)

# Configuração do CORS
origins = [
    "http://localhost",
    "http://localhost:3000",
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Total-Count"],
)

# Monta arquivos estáticos para servir uploads
uploads_dir = os.path.join(os.getcwd(), "uploads")
os.makedirs(uploads_dir, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")

api_prefix = "/api"
app.include_router(auth_controller.router, prefix=f"{api_prefix}/auth", tags=["auth"])
app.include_router(user_controller.router, prefix=f"{api_prefix}/users", tags=["users"])
app.include_router(lead_controller.router, prefix=f"{api_prefix}/leads", tags=["leads"])
app.include_router(area_of_expertise_controller.router, prefix=f"{api_prefix}", tags=["areas-of-expertise"])
app.include_router(campaign_controller.router, prefix=f"{api_prefix}/campaigns", tags=["campaigns"])
app.include_router(channel_controller.router, prefix=f"{api_prefix}/channels", tags=["channels"])
app.include_router(analytics_controller.router, prefix=f"{api_prefix}/analytics", tags=["analytics"])
app.include_router(marketing_controller.router, prefix=f"{api_prefix}", tags=["marketing"])
app.include_router(template_controller.router, prefix=f"{api_prefix}", tags=["templates"])

# Upload simples de imagens
BASE_URL = os.getenv("BASE_URL", "http://localhost:8000")


@app.post(f"{api_prefix}/uploads")
async def upload_file(file: UploadFile = File(...)):
    content_type = (file.content_type or "").lower()
    ext = os.path.splitext(file.filename or "")[1].lower()
    # Mapear por tipo: imagens em /images; demais em /files
    if content_type.startswith("image/") or ext in (".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg"):
        target_dir = os.path.join(uploads_dir, "images")
        url_prefix = "/uploads/images/"
        if not ext:
            ext = ".png"
    else:
        # permitir documentos comuns
        allowed_exts = {".pdf", ".doc", ".docx", ".xls", ".xlsx", ".txt"}
        if ext not in allowed_exts:
            # fallback por content_type
            if not any(k in content_type for k in ("pdf", "word", "msword", "officedocument", "excel", "text/")):
                raise HTTPException(status_code=400, detail="Tipo de arquivo não permitido")
        target_dir = os.path.join(uploads_dir, "files")
        url_prefix = "/uploads/files/"
        if not ext:
            ext = ".bin"
    os.makedirs(target_dir, exist_ok=True)
    filename = f"{uuid.uuid4()}{ext}"
    dest_path = os.path.join(target_dir, filename)
    with open(dest_path, "wb") as out:
        out.write(await file.read())
    url_path = f"{url_prefix}{filename}"
    absolute_url = f"{BASE_URL}{url_path}"
    return {"url": absolute_url, "name": file.filename, "content_type": content_type}

@app.get("/", tags=["Root"])
def read_root():
    return {"message": "Bem-vindo ao Sinapse Maestro CRM"}
