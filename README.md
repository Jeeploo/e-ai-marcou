# e aí, marcou?

PWA para busca, comparação e agendamento de consultas.

## Arquitetura

Frontend
- React
- Vite
- TypeScript
- Tailwind CSS

Backend
- Python
- FastAPI
- Pydantic

Banco de dados
- Firebase
- Cloud Firestore

PWA
- Web App Manifest
- Service Worker
- Estratégias de cache/offline

## Estrutura

e-ai-marcou/
├── frontend/
├── backend/
├── docs/
├── .gitignore
├── AGENTS.md
└── README.md

## Responsabilidades

### Backend e banco
Responsável principal: Jefferson

- API REST
- FastAPI
- regras de negócio
- validações
- integração com Firestore
- testes do backend
- segurança

### Frontend
Responsável principal: equipe de frontend

- React
- interface
- responsividade
- integração com API
- experiência PWA
- acessibilidade

## Desenvolvimento

O projeto seguirá desenvolvimento incremental:

1. Interface e navegação
2. API REST
3. Persistência
4. CRUD
5. PWA
6. Offline
7. Deploy HTTPS
8. Autenticação e autorização

## Status

Em desenvolvimento.

## Execução rápida para avaliação — sem Firebase

Requisitos: Python 3.10+ e Node.js 20.19+ ou 22.12+.

```bash
git clone https://github.com/Jeeploo/e-ai-marcou.git
cd e-ai-marcou/backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```

Em outro terminal, a partir do diretório onde você clonou o repositório:

```bash
cd e-ai-marcou/frontend
npm install
npm run dev
```

O `.env.example` configura `DATA_MODE=demo`. Nenhuma credencial Firebase é
necessária. A mesma API FastAPI atende todos os endpoints; o frontend não usa
mocks nem guarda agendamentos no navegador. `VITE_API_URL` é opcional em
desenvolvimento: seu fallback é `http://localhost:8000`. Em produção, configure
`VITE_API_URL` com a URL pública da API, ou use o mesmo domínio com proxy `/api`.

URLs locais:

- Frontend: http://localhost:5173
- API: http://localhost:8000
- Swagger: http://localhost:8000/docs
- Health: http://localhost:8000/api/health

O demo inicia com especialidades, clínicas de Recife, profissionais, horários
para os próximos 15 dias e agendamentos ativo e cancelado para `paciente-demo`
(o identificador padrão do frontend). Os filtros de profissionais continuam
sendo aplicados pela interface sobre o catálogo retornado pela API.
Os dados ficam em memória e voltam ao estado inicial quando o backend reinicia,
inclusive no reload. Cancelar preserva o agendamento no histórico e libera o
horário; remarcar libera o horário anterior.

### Alternar para Firestore e preservar produção

No backend, troque `DATA_MODE=demo` por `DATA_MODE=firebase` e configure
`FIREBASE_CREDENTIALS` e `FIREBASE_PROJECT_ID`. Nunca versionar `.env` ou a
credencial. Variáveis de ambiente do processo têm prioridade sobre `.env`.
**No Render, configure explicitamente `DATA_MODE=firebase`**, junto das
credenciais e das origens CORS já utilizadas. Sem `DATA_MODE`, o padrão permanece
`firebase` para compatibilidade com instalações existentes. Nenhuma mudança de
endpoint ou configuração de modo no frontend é necessária.

O fluxo permanece `route → service → repository`. O provider seleciona os
repositórios Firestore existentes ou os de memória, ambos usando os mesmos
schemas Pydantic. No Firestore a reserva usa transações; no demo, um lock comum
protege validação e alteração dos horários/agendamentos. **Execute o demo com
um único processo/worker**: a memória e o lock não são compartilhados entre
processos ou réplicas. O demo é destinado à avaliação local, não à persistência
em produção.

### Verificação

```bash
cd backend
source .venv/bin/activate
pytest
```

```bash
cd frontend
npm run build
npm run test:api
```

`test:api` valida a interface com respostas HTTP controladas pelo Playwright.
Para validar também o fluxo contra a API demo real (sem interceptação HTTP):

```bash
cd frontend
npm run test:demo
```

Essa suíte inicia automaticamente backend e frontend, sem credenciais. Se o
Chromium do Playwright ainda não estiver instalado, execute
`npx playwright install chromium` antes das suítes de navegador.
