# Integração do módulo de acessibilidade

> Atualização: a estabilização posterior e os resultados atuais da suíte/offline estão em [estabilizacao-e2e.md](estabilizacao-e2e.md). As falhas e pendências abaixo registram a primeira etapa.

Integração em 05/11/2026 sobre o frontend atual, que usa catálogo e agendamentos via API. O guia copiado descrevia uma revisão anterior. Nenhum código de backend ou acesso ao Firebase/Firestore foi alterado.

## Arquivos e decisões

- `frontend/package.json` e `package-lock.json`: adicionada somente Zustand, ausente anteriormente. React, Lucide, Tailwind e ferramentas de teste existentes foram mantidos.
- `frontend/src/App.tsx`: conteúdo das rotas marcado com `data-a11y-content`; um único widget irmão, com chave `marcou:a11y:v1`. Rotas e providers preservados.
- `frontend/src/main.tsx`: CSS do módulo depois do CSS principal; CSS de adaptação por último. StrictMode, BrowserRouter e registro do service worker preservados.
- `frontend/src/hooks/ProfileContext.tsx`: `profile.textSize` passa a ser uma projeção da store (acima de 100% = Grande). Salvar outros dados do Perfil não arredonda o percentual escolhido no painel. Normal/Grande continuam visíveis e selecionam 100/125%. Preferência antiga Grande é migrada apenas na ausência do registro novo. Reset persistido tem precedência sobre o dado antigo de sessão.
- `frontend/src/index.css`: retirada somente a regra de fonte raiz em 20px, evitando ampliação cumulativa.
- `frontend/src/accessibility-integration.css`: filtros aplicados às regiões visuais, sem transformar o ancestral da navegação fixa em containing block; preservado modo de cores forçadas. Botão esquerdo deslocado além da sidebar desktop. Posições inferiores mobile afastadas da navegação, acompanhando escala e safe area; altura do painel limitada ao espaço disponível. Corrigida a cor do subtítulo sobrescrita pelo seletor global `p`.
- `frontend/src/accessibility-module/components/AccessibilityWidget.tsx`: única adaptação interna do módulo: passo do slider de texto de 10 para 5, para representar os 125% legados sem arredondamento nativo para 130%. Demais fontes e documentos do pacote preservados.
- `frontend/tests/accessibility-integration.spec.ts`: testes de integração com fixtures HTTP locais, sem dados reais; viewports 320, 375 e 1440px, rotas Home/Busca/Agenda/Perfil/profissional, modal de consulta, Axe, teclado, retorno de foco, persistência, migração/reset, tamanho sem acúmulo, navegação fixa sob filtros e posições inferiores com escala de página.

O widget continua disponível no estado de sessão encerrada. Modais de negócio continuam usando dialog nativo na top layer, sem portal fora do conteúdo. O service worker gerado pelo Vite já inclui os bundles JS/CSS do módulo; não foi necessária mudança de cache. VLibras não foi montado.

## Validação

- Testes novos de integração: 5/5 aprovados na execução final; Axe nas telas completas nos três viewports. Capturas do painel em 320px e desktop inspecionadas visualmente.
- `npm run typecheck`: aprovado.
- `npm run build`: aprovado.
- `node --test src/accessibility-module/tests/store.test.cjs`: aprovado (arquivo contém seis cenários, incluindo SSR).
- Smoke fornecido pelo módulo, com `PLAYWRIGHT_CHANNEL=chromium`: aprovado em 320x568 e 1440x900; cinco submenus, Axe, teclado, persistência e reset.
- `npm run test:api`: 9/9 aprovados, contratos HTTP simulados.
- `npm run test:demo`: 1/1 aprovado com API local em modo demo; busca, agendamento, remarcação e cancelamento.
- Suíte geral `npm run test:e2e` executada: a primeira execução teve 8 aprovados e 18 falhas. Três falhas eram dos testes novos antes da correção do slider e passaram na repetição. As outras 15 são testes existentes que esperam catálogo/consultas antigos, indisponíveis sem API nessa configuração (fluxos, mapa, modais e layouts com dados). Não se declara a suíte geral verde. Os testes Axe existentes de páginas em 375 e 1440 passaram, mas algumas dessas rotas exibiam estados de erro por ausência de API; por isso a integração também audita páginas completas com fixtures HTTP.

## Limites e validação humana

Validar com NVDA/VoiceOver/TalkBack e usuários reais: ordem de leitura, pronúncia e fala audível, contraste dos filtros conforme as necessidades individuais, zoom nativo/reflow e uso em dispositivos físicos. Conferir também combinações extremas de ajustes e fontes opcionais. Axe e emulação não certificam conformidade WCAG.

A suíte geral antiga precisa ser atualizada para o contrato/API atual ou receber ambiente de dados controlado; esse trabalho não foi misturado à integração. Offline de fluxos de negócio da suíte antiga ficou sem validação conclusiva, embora o build e a verificação existente de instalabilidade tenham passado. VLibras permanece opcional para outra etapa.

Sem commit ou push.
