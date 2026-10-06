# E aí, marcou? — Frontend

Para conferir a entrega, comece pelo [checklist completo](./CHECKLIST.md).

Ele explica o que foi feito em cada parte do frontend, os testes realizados e as ressalvas de integração para o Jefferson continuar. Também traz os comandos para abrir o projeto e testar a PWA.

O trabalho está na branch `frontend`. Nenhum merge com `main` ou `backend` faz parte desta entrega.

Para preparar o endereço público, veja [como publicar](./PUBLICACAO.md). O checklist também separa o que depende de backend, configuração ou informações da equipe.

## Inicialização direta com a API

Use `npm run dev` com o backend em execução. O frontend usa exclusivamente a
API HTTP, tanto com `DATA_MODE=demo` quanto com `DATA_MODE=firebase` no backend.
Em desenvolvimento, `VITE_API_URL` é opcional e tem fallback para
`http://localhost:8000`. `VITE_PATIENT_ID` tem padrão `paciente-demo`.
`VITE_DATA_MODE` não seleciona mais mocks locais. Os comandos `dev:api` e
`build:api` continuam disponíveis por compatibilidade.

Veja [execução rápida sem Firebase](../README.md#execução-rápida-para-avaliação--sem-firebase)
para preparar o backend. A documentação anterior de protótipo no checklist deve
ser lida considerando que agendamentos e catálogos agora vêm da API.

```bash
npm install
npm run dev
npm run build
npm run test:api
npm run test:demo
```

`test:api` testa contratos com respostas HTTP controladas. `test:demo` inicia o
FastAPI com dados em memória e valida o fluxo real pela interface, sem mocks.
O segundo comando de teste requer o ambiente `backend/.venv` preparado.
