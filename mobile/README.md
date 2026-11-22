# e aí, marcou? — mobile

Cliente independente em Expo SDK 58, React Native e TypeScript. O PWA continua em `../frontend` e a API em `../backend`.

## Executar

Requer Node 22.13+ na linha 22 LTS (ou versão compatível indicada em package.json).

```bash
cd mobile
npm ci
npm start
```

Abra em um cliente Expo compatível com SDK 58. Caso o Expo Go instalado ainda não suporte esse SDK, será necessário um development build compatível. Android: `npm run android` com emulador configurado; iOS: `npm run ios` com simulador no macOS.

## Verificar

```bash
npm run typecheck
npx expo install --check
npx expo export --platform android --platform ios
```

A exportação verifica os bundles JavaScript; não gera APK/IPA e não substitui execução em dispositivo.

## Estrutura e navegação

`App.tsx` monta SafeAreaProvider. RootNavigator contém NavigationContainer e o native stack raiz. MainTabs contém Início, Buscar, Consultas e Perfil. As jornadas intermediárias poderão ser adicionadas ao stack raiz.

As telas são placeholders, sem layout do Figma, chamadas HTTP, localização ou regras de negócio. Os diretórios vazios de src são preservados por .gitkeep.

Referências futuras: página Figma “06 — Mobile | Revisão humanizada” para UI e “09 — Protótipo integrado | Jornada do produto” para fluxos e estados.
