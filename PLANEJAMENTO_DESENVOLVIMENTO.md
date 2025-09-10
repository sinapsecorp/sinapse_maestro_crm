# Planejamento de Desenvolvimento - Sinapse Maestro CRM

## Visão Geral do Projeto

O **Sinapse Maestro CRM** é um sistema de gerenciamento de relacionamento com cliente (CRM) focado em gestão de leads e campanhas de e-mail marketing. O projeto será desenvolvido seguindo os princípios SOLID e arquitetura em camadas para garantir alta qualidade, manutenibilidade e extensibilidade.

### Stack Tecnológica
- **Backend**: Python 3, FastAPI, Alembic, Ruff, Pydantic
- **Banco de Dados**: PostgreSQL
- **Frontend**: React.js, Shadcn/UI, Tailwind CSS, Lucide React, Recharts
- **Containerização**: Docker e Docker Compose

### Paleta de Cores (Modo Escuro)
- **Fundo Principal**: #012a4a
- **Fundos Secundários**: #013a63, #01497c
- **Elementos Interativos**: #2a6f97, #2c7da0
- **Destaques**: #61a5c2, #89c2d9
- **Sucessos**: #a9d6e5
- **Texto Principal**: #FFFFFF

---

## FASE 1: Setup e Configuração Inicial

### 1.1 Estrutura do Projeto
```
sinapse-maestro-crm/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── repositories/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── config/
│   │   ├── database/
│   │   └── utils/
│   ├── alembic/
│   ├── requirements.txt
│   ├── pyproject.toml
│   └── main.py
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/
│   │   │   ├── forms/
│   │   │   ├── charts/
│   │   │   └── layout/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── utils/
│   │   ├── styles/
│   │   └── assets/
│   ├── public/
│   └── package.json
├── docker-compose.yml
├── .env.example
└── README.md
```

### 1.2 Configuração do Ambiente
- [x] Criar estrutura de diretórios
- [x] Configurar Docker Compose (PostgreSQL, Backend, Frontend)
- [x] Setup do backend com FastAPI
- [x] Setup do frontend com Vite + React
- [x] Configuração do ESLint/Prettier (frontend)
- [x] Configuração do Ruff (backend)
- [x] Configuração do Alembic para migrations
- [x] Arquivo de environment variables

---

## FASE 2: Backend - Fundação e Modelos

### 2.1 Modelos de Dados

#### User
```python
class User(BaseModel):
    id: UUID
    email: str
    password_hash: str
    first_name: str
    last_name: str
    is_active: bool
    created_at: datetime
    updated_at: datetime
```

#### Lead
```python
class Lead(BaseModel):
    id: UUID
    full_name: str
    email: str
    phone: Optional[str]
    company: Optional[str]
    job_title: Optional[str]
    area_of_expertise_id: UUID
    user_id: UUID  # FK
    created_at: datetime
    updated_at: datetime
```

#### AreaOfExpertise
```python
class AreaOfExpertise(BaseModel):
    id: UUID
    name: str
    description: Optional[str]
    created_at: datetime
```

#### Campaign
```python
class Campaign(BaseModel):
    id: UUID
    name: str
    subject: str
    body: str
    status: CampaignStatus  # DRAFT, SENT, SCHEDULED
    user_id: UUID  # FK
    created_at: datetime
    updated_at: datetime
    sent_at: Optional[datetime]
```

#### CampaignLead (Tabela de Relacionamento)
```python
class CampaignLead(BaseModel):
    id: UUID
    campaign_id: UUID  # FK
    lead_id: UUID  # FK
    sent_at: Optional[datetime]
    status: EmailStatus  # PENDING, SENT, FAILED
```

### 2.2 Estrutura Backend (Seguindo SOLID)

#### Controllers (Apresentação)
- `auth_controller.py` - Login, logout, token refresh
- `dashboard_controller.py` - Dados para dashboard
- `lead_controller.py` - CRUD de leads, importação CSV
- `campaign_controller.py` - CRUD de campanhas, disparo

#### Services (Regras de Negócio)
- `auth_service.py` - Lógica de autenticação
- `lead_service.py` - Validações, processamento CSV
- `campaign_service.py` - Lógica de campanhas, agendamento
- `email_service.py` - Envio de e-mails em background

#### Repositories (Acesso a Dados)
- `user_repository.py`
- `lead_repository.py`
- `campaign_repository.py`
- `area_of_expertise_repository.py`

#### DTOs/Schemas (Pydantic)
- `auth_schemas.py`
- `lead_schemas.py`
- `campaign_schemas.py`
- `dashboard_schemas.py`

### 2.3 Tarefas Backend Fase 2
- [x] Configurar conexão com PostgreSQL
- [x] Criar modelos SQLAlchemy
- [x] Implementar repositories (padrão Repository)
- [x] Criar migrations iniciais
- [x] Implementar autenticação JWT
- [x] Desenvolver services com validações
- [x] Criar controllers com endpoints REST
- [x] Implementar middleware de autenticação
- [x] Configurar CORS
- [ ] Testes unitários para services

---

## FASE 3: Frontend - Componentes Base

### 3.1 Configuração e Setup
- [x] Configurar Shadcn/UI com tema dark
- [x] Criar sistema de cores personalizado no Tailwind
- [x] Configurar React Router
- [x] Setup de gerenciamento de estado (Zustand ou Context)
- [x] Configurar interceptadores HTTP (Axios)

### 3.2 Componentes UI Base

#### Layout
- `Sidebar.jsx` - Navegação principal
- `Header.jsx` - Cabeçalho com dados do usuário
- `Layout.jsx` - Container principal

#### Componentes Reutilizáveis
- `Card.jsx` - Cards do dashboard
- `DataTable.jsx` - Tabelas de dados
- `FormField.jsx` - Campos de formulário
- `Modal.jsx` - Modais do sistema
- `Button.jsx` - Botões personalizados
- `LoadingSpinner.jsx` - Indicadores de loading

### 3.3 Páginas Principais

#### Autenticação
- `LoginPage.jsx` - Tela de login
- `ForgotPasswordPage.jsx` - Recuperação de senha

#### Dashboard
- `DashboardPage.jsx` - Dashboard principal
- `WelcomeCard.jsx` - Card de boas-vindas
- `StatsCard.jsx` - Cards de estatísticas
- `LeadsChart.jsx` - Gráfico de leads por área

### 3.4 Tarefas Frontend Fase 3
- [x] Criar layout base responsivo
- [x] Implementar tema dark com paleta personalizada
- [x] Desenvolver componentes UI base
- [x] Criar página de login com validações
- [x] Implementar dashboard com cards e gráficos
- [x] Configurar roteamento protegido
- [x] Implementar gerenciamento de estado
- [ ] Testes de componentes

---

## FASE 4: Funcionalidades Principais

### 4.1 Gestão de Leads

#### Backend
- [x] Endpoint para listagem paginada de leads
- [x] Endpoint para cadastro de lead
- [x] Endpoint para importação CSV
- [x] Validação de dados de lead
- [x] Processamento de arquivo CSV em background

#### Frontend
- [] `LeadsPage.jsx` - Listagem de leads
- [] `LeadForm.jsx` - Formulário de cadastro
- [] `LeadImport.jsx` - Importação de CSV
- [] Validações de formulário
- [] Feedback visual para operações

### 4.2 Campanhas de E-mail

#### Backend
- [ ] Endpoints CRUD para campanhas
- [ ] Endpoint para disparo de campanha
- [ ] Sistema de filas para e-mails (Celery/RQ)
- [ ] Integração com provedor de e-mail
- [ ] Tracking de status de envio

#### Frontend
- [ ] `CampaignsPage.jsx` - Listagem de campanhas
- [ ] `CampaignForm.jsx` - Criação/edição
- [ ] `CampaignDispatch.jsx` - Modal de disparo
- [ ] Editor de texto para corpo do e-mail
- [ ] Seleção de listas de leads

### 4.3 Tarefas Fase 4
- [ ] Implementar CRUD completo de leads
- [ ] Desenvolver importação CSV com validações
- [ ] Criar sistema de campanhas
- [ ] Implementar disparo de e-mails
- [ ] Adicionar feedback e notificações
- [ ] Implementar filtros e busca
- [ ] Testes de integração

---

## FASE 5: Polimento e Deploy

### 5.1 Melhorias de UX
- [ ] Loading states em todas as operações
- [ ] Mensagens de erro personalizadas
- [ ] Confirmações para ações destrutivas
- [ ] Paginação e ordenação de tabelas
- [ ] Responsividade para tablets/mobile
- [ ] Otimização de performance

### 5.2 Segurança e Validações
- [ ] Validação de tipos de arquivo (CSV)
- [ ] Sanitização de dados de entrada
- [ ] Rate limiting nas APIs
- [ ] Logs de auditoria
- [ ] Tratamento de erros robusto

### 5.3 Deploy e Documentação
- [ ] Dockerfile para backend e frontend
- [ ] Docker Compose para produção
- [ ] Variáveis de ambiente para produção
- [ ] Documentação da API (Swagger)
- [ ] README com instruções de setup
- [ ] Scripts de deploy

---

## Cronograma Estimado

| Fase | Descrição | Duração Estimada |
|------|-----------|------------------|
| 1 | Setup e Configuração | 1-2 dias |
| 2 | Backend - Modelos e API | 3-4 dias |
| 3 | Frontend - Componentes Base | 3-4 dias |
| 4 | Funcionalidades Principais | 4-5 dias |
| 5 | Polimento e Deploy | 2-3 dias |

**Total Estimado**: 13-18 dias

---

## Princípios de Desenvolvimento

### SOLID Aplicado
1. **SRP**: Cada service, controller e component tem uma responsabilidade específica
2. **OCP**: Interfaces permitem extensão sem modificação
3. **LSP**: Substituição de implementações sem quebrar funcionalidade
4. **ISP**: Interfaces específicas para cada contexto
5. **DIP**: Dependência de abstrações, não de implementações concretas

### Qualidade de Código
- Testes automatizados (unitários e integração)
- Linting e formatação automática
- Documentação clara no código
- Commits semânticos
- Code review antes de merge

---

## Próximos Passos

1. Revisar e aprovar este planejamento
2. Configurar ambiente de desenvolvimento
3. Iniciar Fase 1 com setup do projeto
4. Desenvolver incrementalmente seguindo as fases
5. Testar continuamente cada funcionalidade

Este planejamento serve como guia para o desenvolvimento do MVP, podendo ser ajustado conforme necessário durante a implementação.
