from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.controllers import auth_controller, user_controller, lead_controller, area_of_expertise_controller, campaign_controller

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

app.include_router(auth_controller.router, prefix="/auth", tags=["auth"])
app.include_router(user_controller.router, prefix="/users", tags=["users"])
app.include_router(lead_controller.router, prefix="/leads", tags=["leads"])
app.include_router(area_of_expertise_controller.router, tags=["areas-of-expertise"])
app.include_router(campaign_controller.router, prefix="/campaigns", tags=["campaigns"])

@app.get("/", tags=["Root"])
def read_root():
    return {"message": "Bem-vindo ao Sinapse Maestro CRM"}
