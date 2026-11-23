# Cliente mobile

Seguir também o AGENTS.md da raiz.

- Expo SDK 58 + React Native + TypeScript.
- Usar React Navigation com native stack e bottom tabs. Não usar Expo Router.
- Manter frontend/ e backend/ independentes deste cliente.
- Acesso a dados somente pela API FastAPI; nunca acessar Firestore diretamente.
- Instalar módulos nativos com `npx expo install` para respeitar o SDK.
- Executar `npm run typecheck` e validar os bundles Android/iOS após mudanças de navegação.
- Consultar a documentação correspondente ao SDK antes de alterar APIs Expo.
