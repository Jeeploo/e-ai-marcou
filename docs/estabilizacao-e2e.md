# Estabilização dos testes após integração de acessibilidade

Data: 05/11/2026. Complementa e substitui as pendências de suíte geral/offline registradas em `integracao-acessibilidade.md`.

## Análise individual das 15 falhas antigas

As verificações de interface continuam úteis. O que ficou obsoleto foi a preparação dos dados: o frontend atual consulta catálogo, horários e agendamentos pela API; não usa o antigo catálogo local nem uma agenda pré-carregada no navegador.

| # | Teste antigo | Diagnóstico e atualização |
| --- | --- | --- |
| 1 | modais, confirmação e teclado acessíveis | Esperava consulta e horários locais. Agora recebe agenda e horários por HTTP; mantém Axe, Tab, Escape e retorno de foco. Acrescentada auditoria explícita do hover no link do modal de sucesso. |
| 2 | busca preserva filtros e mostra estado vazio | Contagens esperavam catálogo local. Fixture HTTP explícita com seis profissionais e duas clínicas de Cardiologia; preservados filtros, retorno, vazio e limpeza. |
| 3 | agenda cria, persiste, remarca e mantém cancelamento no histórico | Dependia da persistência local anterior. Agora POST/PATCH/DELETE alteram o estado da API simulada, compartilhado pelo contexto; reload faz nova leitura HTTP. Todas as verificações do fluxo foram preservadas. |
| 4 | conflito entre abas não cria uma segunda consulta | Conflito passou a ser responsabilidade HTTP. Estado compartilhado entre abas responde 201/409; teste também verifica uma única consulta criada. |
| 5 | PWA registra cache e abre offline, bloqueando agendamento | Presumia horários locais após reload offline. Transferido e ampliado em `pwa.spec.ts`: shell e painel em cache, API indisponível, escritas bloqueadas, recuperação online. |
| 6 | layouts sem overflow horizontal em 320px | Catálogo ausente impedia avaliar os cards. Dados HTTP controlados; espera conteúdo carregado, preserva geometria e overflow. |
| 7 | layouts sem overflow horizontal em 375px | Mesmo problema; mesmas verificações na largura correspondente. |
| 8 | layouts sem overflow horizontal em 430px | Mesmo problema; mesmas verificações na largura correspondente. |
| 9 | layouts sem overflow horizontal em 768px | Mesmo problema; mesmas verificações na largura correspondente. |
| 10 | layouts sem overflow horizontal em 1024px | Mesmo problema; mesmas verificações na largura correspondente. |
| 11 | layouts sem overflow horizontal em 1440px | Mesmo problema; mesmas verificações na largura correspondente. |
| 12 | voltar visível nas telas secundárias em 375px | Agenda sem consultas impedia abrir detalhes. Fixture HTTP fornece consulta futura; preservados tamanho, cores, ícone, navegação e fechamento do modal. |
| 13 | voltar visível nas telas secundárias em 1440px | Mesmo problema; mesmas verificações no desktop. |
| 14 | referências do Figma e textos revisados | Sem catálogo, não havia preview com link de endereço. Agora usa catálogo HTTP e mantém verificações de textos, mapa e notificações. |
| 15 | mapa Google acompanha a clínica selecionada | Esperava múltiplos profissionais locais. Fixture fornece clínicas distintas; mantém seleção e mudança de URL. |

Nenhum desses testes foi descartado. O teste PWA foi movido de `flows.spec.ts` para um arquivo dedicado e ampliado.

## Fixture e escopo

`frontend/tests/fixtures/app.ts` intercepta somente a API e o documento externo do Google Maps. Profissionais, clínicas e especialidades têm dados de teste independentes de `src/data/catalog.ts`. Horários refletem ocupação; datas são futuras; agendamentos persistem no estado HTTP durante o teste, incluindo reload e outras abas. Contextos de testes distintos são isolados. Endpoints desconhecidos respondem 501, em vez de sucesso vazio.

`flows.spec.ts`, `accessibility.spec.ts` e `review.spec.ts` usam essa fixture. A inspeção visual com contexto persistente também recebe a mesma API, evitando capturas enganosas de telas de erro. O serviço externo do mapa é substituído por HTML de teste, mas endereço e mudança de seleção são verificados na aplicação. A suíte de contrato HTTP e o fluxo de API demo real continuam separados e foram preservados.

## Bug real encontrado

Não foi identificada regressão causada pelo módulo de acessibilidade. O teste de confirmação, agora com dados disponíveis, revelou contraste insuficiente no hover de `.primary`: branco sobre `#d44624`, razão 4,46:1, abaixo de 4,5:1. A regra já existia antes da integração. Única mudança de produção desta estabilização: fundo de hover para `#b63718`. O teste agora exige explicitamente esse estado durante a auditoria Axe. Não houve alteração de arquitetura nem de comportamento do módulo.

## Contrato offline verificado

O teste usa o build de produção, `navigator.serviceWorker.ready`, controlador ativo, CacheStorage real e `context.setOffline(true)`. HTML, JavaScript, CSS e manifest não são interceptados. Um fetch fora do cache falha, comprovando a perda de rede; o shell continua abrindo após reload e em outra aba numa rota ainda não visitada.

- Agendar, confirmar e confirmar remarcação ficam desabilitados offline. Cancelar também fica desabilitado; nenhuma mutação HTTP é enviada.
- Após reload offline, catálogo, horários e consultas não são inventados nem recuperados do cache. A interface informa que precisa de conexão; o cache não contém `/api/`.
- Painel local abre por teclado, ajusta texto a 150%, persiste após reload, redefine para 100% e preserva o reset em novo reload, ainda sem rede.
- A opção Grande do Perfil funciona offline e persiste. O mapa informa a dependência de internet e remove o iframe.
- Ao reconectar e recarregar, horários voltam a carregar e o aviso offline desaparece.
- Manifest offline mantém `display: standalone`; a verificação Chromium de critérios de instalação continua sem erros.

O script manual `tests/pwa-install.cjs` foi revisado e mantido como opção para instalar/desinstalar uma janela real do Edge com interface gráfica. Não faz parte da suíte headless e não é necessário para comprovar o cache/offline do aplicativo. Instalação em dispositivo físico, leitores de tela e voz audível continuam sendo validações humanas. VLibras e voz offline não são requisitos desta etapa.

## Arquivos desta estabilização

- `frontend/tests/fixtures/app.ts` (novo).
- `frontend/tests/pwa.spec.ts` (novo; substitui e amplia o cenário offline de flows).
- `frontend/tests/flows.spec.ts`.
- `frontend/tests/accessibility.spec.ts`.
- `frontend/tests/review.spec.ts`.
- `frontend/src/index.css` (somente cor de hover nesta etapa).
- `docs/estabilizacao-e2e.md` e `docs/integracao-acessibilidade.md`.

As alterações anteriores da integração em App, main, ProfileContext, CSS de adaptação, módulo copiado, dependências e testes de integração permanecem no diretório de trabalho. Não houve commit nem push.

## Resultado final

| Verificação | Resultado |
| --- | --- |
| `npm run typecheck` | Aprovado |
| `npm run build` | Aprovado |
| `npm run test:e2e` | 27/27 aprovados; inclui Axe e offline real |
| `npm run test:api` | 9/9 aprovados |
| `npm run test:demo` | 1/1 aprovado com FastAPI demo local |
| `node --test src/accessibility-module/tests/store.test.cjs` | Aprovado; arquivo contém seis cenários de store/SSR |
| Smoke entregue pelo módulo com Chromium | 2/2 viewports aprovados (320x568 e 1440x900), incluindo cinco submenus, Axe, teclado, persistência e reset |
| Critérios Chromium de instalabilidade | Nenhum erro |
| `git diff --check` | Aprovado |

A primeira rodada teve 26/27 E2E aprovados e revelou o bug de contraste descrito acima; a rodada final integral passou após a correção. A primeira tentativa do smoke final ocorreu depois do encerramento automático do servidor E2E e falhou por conexão recusada. Reexecutado com preview temporário dedicado, passou nos dois viewports.

## Lista acumulada do diretório de trabalho antes do commit

Além dos oito arquivos desta estabilização listados acima, permanecem as alterações da integração anterior:

- `frontend/package.json` e `frontend/package-lock.json`.
- `frontend/src/App.tsx`.
- `frontend/src/main.tsx`.
- `frontend/src/hooks/ProfileContext.tsx`.
- `frontend/src/accessibility-integration.css`.
- `frontend/tests/accessibility-integration.spec.ts`.
- `frontend/src/accessibility-module/` (pasta fornecida, ainda não rastreada no Git; a alteração interna feita na integração anterior é o passo do slider em `components/AccessibilityWidget.tsx`).

`frontend/src/index.css` inclui tanto a retirada anterior da ampliação raiz como a correção de hover desta etapa. Nenhum fonte do módulo foi alterado novamente nesta estabilização. Saídas de build/testes são ignoradas ou temporárias; nenhuma dependência adicional foi instalada nesta etapa.
