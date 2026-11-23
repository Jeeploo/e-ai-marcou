# e aí, marcou? — mobile

Aplicativo para Android e iOS que permite buscar profissionais de saúde, agendar consultas e acompanhar os agendamentos. O cliente mobile é independente da PWA e consome a API REST compartilhada do projeto.

## Tecnologias

React Native, Expo SDK 58, TypeScript, React Navigation (Native Stack e Bottom Tabs), Context API, Ionicons e React Native Safe Area Context.

## Estrutura resumida

- `src/views/` reúne telas e componentes. `src/navigation/` define as rotas.
- `src/models/`, `src/controllers/` e `src/services/` organizam tipos, fluxos e chamadas HTTP.
- `src/contexts/` reúne o estado compartilhado. `src/hooks/` contém hooks de carregamento, tema e layout.
- `src/config/`, `src/theme/` e `src/utils/` concentram configuração, estilos e funções auxiliares.
- `assets/doctors/` armazena as fotos locais dos profissionais.

## Navegação

As Bottom Tabs dão acesso a **Início**, **Buscar**, **Consultas** e **Perfil**. O Native Stack raiz contém as abas e as rotas de **Horários**, **Revisão**, **Confirmação** e **Detalhes da consulta**.

## Funcionalidades

- Busca de profissionais com filtros, ordenação e fotos locais.
- Seleção de horários, revisão e confirmação do agendamento.
- Lista de consultas, detalhes, remarcação e cancelamento. O `AppointmentsContext` mantém Início e Consultas sincronizados.
- Perfil com dados do paciente de demonstração e preferências de acessibilidade. A interface oferece texto maior, alto contraste e ajuste de layout à largura e à escala de fonte do sistema.

## Integração com API

O aplicativo usa a API FastAPI em <https://e-ai-marcou.onrender.com> por padrão. Defina `EXPO_PUBLIC_API_URL` em `mobile/.env` para usar outro servidor acessível pelo dispositivo. O acesso ao Firestore é feito pelo backend.

Com `DATA_MODE=demo` no backend, o aplicativo faz requisições HTTP normalmente e o servidor usa dados em memória. Nas telas que oferecem o fallback local após uma falha, o usuário pode selecionar **Usar dados de demonstração** para continuar com dados do próprio aplicativo.

## Como executar

Use Node.js 22.13+ na série 22 ou outra versão compatível indicada em `package.json`. A partir da raiz do repositório:

```bash
cd mobile
npm ci
npm start
```

Execute os demais comandos deste documento em `mobile/`.

## Expo Go

Leia o QR code do Expo CLI em um dispositivo Android ou iOS com uma versão do Expo Go compatível com o SDK 58. Para conectar o dispositivo ao servidor de desenvolvimento por túnel, execute:

```bash
npx expo start --tunnel
```

## Typecheck e verificações

```bash
npm run typecheck
npx expo install --check
npx expo export --platform android --platform ios
```

Os comandos verificam os tipos, a compatibilidade das dependências e o empacotamento JavaScript para as duas plataformas.

## Build Android com EAS

Com uma conta autenticada no EAS CLI e acesso ao projeto Expo, execute o perfil `preview` de `eas.json` para gerar um APK de distribuição interna.

```bash
npx eas-cli build --platform android --profile preview
```

A documentação completa da arquitetura, do backend e da PWA está no [README principal](../README.md).
