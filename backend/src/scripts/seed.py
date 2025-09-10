import asyncio
from sqlalchemy.orm import Session
from src.database.session import SessionLocal
from src.repositories.user_repository import user_repository
from src.repositories.area_of_expertise_repository import area_of_expertise_repository
from src.schemas.auth_schemas import UserCreate
from src.services.auth_service import auth_service

async def seed_data():
    db: Session = SessionLocal()
    try:
        # Criar Área de Atuação padrão
        area_name = "Tecnologia"
        area = area_of_expertise_repository.get_all(db)
        if not any(a.name == area_name for a in area):
            print(f"Criando área de atuação: {area_name}")
            area_of_expertise_repository.create(db, obj_in={"name": area_name, "description": "Setor de Tecnologia da Informação"})
        else:
            print(f"Área de atuação '{area_name}' já existe.")

        # Criar usuário admin
        admin_email = "admin@admin.com"
        user = user_repository.get_by_email(db, email=admin_email)
        if not user:
            print(f"Criando usuário administrador: {admin_email}")
            user_in = UserCreate(
                email=admin_email,
                password="R0t1t37@",
                first_name="Admin",
                last_name="User",
            )
            created_user = auth_service.create_user(db, user_in=user_in)
            created_user.is_active = True
            db.commit()
            print("Usuário administrador criado com sucesso.")
        else:
            print(f"Usuário '{admin_email}' já existe.")

    finally:
        db.close()

if __name__ == "__main__":
    print("Iniciando o script de seed...")
    asyncio.run(seed_data())
    print("Script de seed concluído.")
