# Desenvolvimento local

Frontend e backend são projetos independentes, sem dependências instaladas globalmente.

## Frontend

Requer Node.js 20.19+ da linha 20 ou Node.js 22.12+ e npm.

```bash
cd frontend
npm ci
npm run dev
```

Abra http://localhost:5173. Para verificar tipos e gerar a versão de produção:

```bash
npm run build
```

React Router possui apenas a rota inicial provisória. Tailwind usa o plugin oficial
para Vite. Lucide React está disponível para futuros componentes.

## Backend

Validado com Python 3.12. A partir da raiz do repositório:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

Abra http://127.0.0.1:8000/docs para a documentação da API. Não há endpoints de
negócio ainda. Para executar o teste de inicialização:

```bash
python -m pytest
```

A configuração tem valores padrão e não exige um arquivo `.env`. `backend/.env.example`
documenta apenas `APP_NAME`; variáveis do processo têm prioridade.

O pacote firebase-admin está instalado, mas não é importado nem inicializado.
Não são necessárias credenciais ou conexão com Firestore.

## Organização

No backend, futuras implementações devem seguir routes → services → repositories.
Schemas descrevem entrada e saída; models ficam reservados aos modelos internos.
No frontend, as pastas vazias são preservadas com `.gitkeep`.

Não há autenticação, PWA, cache offline ou regras de negócio nesta base.
