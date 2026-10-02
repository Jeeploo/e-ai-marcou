# AGENTS.md — e aí, marcou?

## Projeto

"e aí, marcou?" é uma PWA para busca, comparação e agendamento
de consultas.

## Arquitetura

Frontend:
React + Vite + TypeScript + Tailwind CSS

Backend:
Python + FastAPI + Pydantic

Banco:
Firebase Cloud Firestore

Comunicação:
REST API utilizando HTTP/HTTPS e JSON.

Fluxo:

React PWA
→ HTTP/JSON
→ FastAPI
→ Firestore

## Organização

frontend/
Código da interface.

backend/
API, regras de negócio e persistência.

docs/
Documentação técnica do projeto.

## Backend

Manter separação entre:

- routes: endpoints HTTP
- schemas: entrada e saída da API
- services: regras de negócio
- repositories: acesso ao Firestore
- core: configuração e integrações

Rotas não devem acessar diretamente o Firestore.

Fluxo esperado:

route
→ service
→ repository
→ Firestore

## Frontend

O design deve ser:

- mobile-first
- responsivo
- acessível
- simples para pessoas idosas
- visualmente inspirado na organização da Linear

Evitar:

- textos pequenos
- baixo contraste
- ações representadas apenas por ícones
- excesso de informação
- navegação desnecessariamente complexa

## Segurança

Nunca:

- adicionar .env ao Git
- adicionar credenciais Firebase ao Git
- colocar Firebase Admin SDK no frontend
- colocar segredos no código
- expor credenciais administrativas no navegador

Usar variáveis de ambiente.

## Desenvolvimento

Implementar incrementalmente.

Não adicionar funcionalidades avançadas antes que o fluxo principal
esteja funcionando.

Prioridade:

1. Web/UI
2. API
3. Banco
4. CRUD
5. PWA
6. Offline
7. Deploy
8. Autenticação/autorização

## Alterações

Antes de alterações grandes:

1. analisar a estrutura existente
2. preservar funcionalidades existentes
3. alterar apenas o necessário
4. executar testes relevantes
5. informar arquivos modificados

Não refatorar frontend ou backend inteiro sem necessidade.

## Git

Nunca realizar commit ou push automaticamente sem solicitação explícita.

Não modificar arquivos da área de outro integrante sem necessidade.

Branches principais de trabalho:

- main
- backend
- frontend

main deve permanecer estável.
