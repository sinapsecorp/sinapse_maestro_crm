# Sinapse Maestro CRM

O **Sinapse Maestro CRM** é um sistema de gerenciamento de relacionamento com cliente (CRM) focado em gestão de leads e campanhas de e-mail marketing.

## Stack Tecnológica

- **Backend**: Python 3, FastAPI, Alembic, Ruff, Pydantic
- **Banco de Dados**: PostgreSQL
- **Frontend**: React.js, Shadcn/UI, Tailwind CSS, Lucide React, Recharts
- **Containerização**: Docker e Docker Compose

## Setup do Ambiente de Desenvolvimento

### Pré-requisitos

- Docker
- Docker Compose
- Node.js e npm (para setup inicial do frontend)

### Passos para Configuração

1. **Clonar o repositório:**
   ```bash
   git clone <url-do-repositorio>
   cd sinapse-maestro-crm
   ```

2. **Configurar Variáveis de Ambiente:**
   Crie um arquivo `.env` na raiz do projeto, copiando o conteúdo de `.env.example` e ajustando os valores se necessário.
   ```bash
   cp .env.example .env
   ```
   *Observação: Este passo foi omitido durante a automação inicial devido a restrições de segurança. Crie o arquivo manualmente com o seguinte conteúdo:*
   ```
   # PostgreSQL
   POSTGRES_USER=admin
   POSTGRES_PASSWORD=admin
   POSTGRES_DB=sinapse_maestro_crm

   # Backend
   DATABASE_URL=postgresql://admin:admin@db:5432/sinapse_maestro_crm
   SECRET_KEY=your_super_secret_key
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   ```

3. **Construir e Iniciar os Containers:**
   ```bash
   docker-compose up --build -d
   ```

4. **Acessar as Aplicações:**
   - **Backend**: [http://localhost:8000/docs](http://localhost:8000/docs)
   - **Frontend**: [http://localhost:3000](http://localhost:3000)

### Executando Migrations

Para criar uma nova migration:
```bash
docker-compose run --rm backend alembic revision --autogenerate -m "Nome da migration"
```

Para aplicar as migrations:
```bash
docker-compose run --rm backend alembic upgrade head
```
