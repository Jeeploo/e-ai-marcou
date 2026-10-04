# E aí, marcou? — Frontend

Para conferir a entrega, comece pelo [checklist completo](./CHECKLIST.md).

Ele explica o que foi feito em cada parte do frontend, os testes realizados e as ressalvas de integração para o Jefferson continuar. Também traz os comandos para abrir o projeto e testar a PWA.

O trabalho está na branch `frontend`. Nenhum merge com `main` ou `backend` faz parte desta entrega.

Para preparar o endereço público, veja [como publicar](./PUBLICACAO.md). O checklist também separa o que depende de backend, configuração ou informações da equipe.

## Inicialização direta com a API

Use `npm run dev:api` para usar o FastAPI e `npm run build:api` para compilar nesse modo. Configure `VITE_API_URL` e `VITE_PATIENT_ID` com os dados fornecidos pelo backend. Esses comandos não usam o catálogo local, mesmo se `VITE_DATA_MODE=demo` estiver configurado. O backend precisa estar acessível.
