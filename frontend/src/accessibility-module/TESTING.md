# Testes e limites da validação

## Resultados desta entrega

| Verificação | Resultado / classificação |
| --- | --- |
| Testes entregues da store + SSR | 6/6, CONCLUÍDO E VALIDADO |
| Cenários funcionais Edge na fixture portátil | 31/31 (30 + 1 cenário de voz), CONCLUÍDO E VALIDADO; detalhes em evidence/portable-results.json |
| Mesmos cenários no build Vite independente | 31/31 (30 + 1 cenário de voz), CONCLUÍDO E VALIDADO |
| Smoke entregue: teclado/axe/persistência/reset em 320x568 e 1440x900 | 2/2 tamanhos, CONCLUÍDO E VALIDADO |
| TypeScript estrito no módulo | 0 erros; também passa no build da cópia Vite |
| Lint dos fontes exportados | Sem erros/avisos na revisão final |
| Build isolado Next 16.4.3 | Server Layout importando o módulo, TypeScript e geração estática concluídos com webpack |
| Build isolado Vite | TypeScript + Vite concluído com React 19.0.0, lucide-react 0.468.0 e Zustand 5.0.14 |
| Suíte original `npm test` | 137 passaram, 1 ignorado (teste HTTP de SEO), 0 falhas |
| Build original padrão `npm run build` | PENDENTE de resolver falha interna do Turbopack ao iniciar processo CSS, reproduzida no ambiente |
| Build original alternativo `next build --webpack` | Concluído, geração de rotas encerrada com saída 0 |
| Originais inspecionados | 11 arquivos por SHA-256; nenhum alterado por esta tarefa |
| Leitor de tela humano, fala audível e VLibras remoto | DEPENDÊNCIA EXTERNA / PENDENTE de validação |

## Como foram feitos os testes funcionais

Primeiro foi executado o componente original real, sem modificações, numa fixture React com seu globals.css e store. A única simulação era a conta Supabase sem sessão: não houve acesso a contas/dados reais. Essa comparação aprovou 9 de 19 critérios; dez falhas correspondem aos achados de teclado, persistência local ausente, escala/fonte/mídia, redução nativa, matrizes de cores e semântica/axe. Isso não representa um teste completo do site nem dez funcionalidades inéditas prometidas pelo original: alguns critérios são requisitos de portabilidade introduzidos nesta tarefa.

Depois os mesmos cenários e cenários adicionais rodaram na cópia derivada, com CSS real do Tailwind, StrictMode e Edge headless. A portabilidade foi conferida com cópia independente dos fontes, imports relativos e instalação própria de React 19.0.0, Vite 7.0.0, Tailwind 4.3.2, lucide-react 0.468.0 e Zustand 5.0.14. Uma referência local que o npm adicionou automaticamente na preparação foi retirada antes do build final e da execução final. Não há importação da loja na cópia final.

A fixture foi usada para inspecionar:

- Abrir/fechar e retornar foco usando Enter, Space e Escape.
- Contenção de Tab/Shift+Tab e exclusão de submenu inativo; radios nativos com setas.
- Preferência de texto → reload → mantida; reset → reload → defaults.
- Entrada inválida/limites de store, perfis/fontes, storage bloqueado e JSON corrompido.
- Texto px/rem e trecho aninhado a 200%, sem fator duplicado; zoom somente no container.
- Ativação/remoção de filtros, espaçamentos, alinhamento, fontes, leitura, destaques e animações.
- Silenciamento/restauração de mídias; preservação de mídia interativa quando imagens são ocultadas.
- Navegação simulada entre duas páginas preservando o widget e as preferências.
- Desmontagem com restauração de estilos/classes/mídia.
- Preferência nativa de movimento, contraste aumentado e cores forçadas por emulação.
- Guias de leitura com mouse, seis posições, larguras 320/390/768/1024/1440 e alturas 568/360.
- Voz indisponível sem erro; simulador da API de fala para leitura visível/seleção, velocidade, pausa/retomada/parada, preservação de cliques e cancelamento no reset.
- Axe 4.12.1, tags WCAG A/AA 2.0/2.1/2.2, no painel e cinco submenus.

O simulador de voz verifica as chamadas da lógica; não prova que o usuário escutou uma voz adequada. Emulação de viewport/mídia não é teste num dispositivo físico. A navegação simulada não certifica todas as rotas do grupo. Nenhuma compra/login foi feito.

## Repetir os testes fornecidos

Depois de integrar no projeto React/TS, a partir da pasta do package.json do frontend:

```bash
node --test src/accessibility-module/tests/store.test.cjs
```

É necessário TypeScript como dependência de desenvolvimento; React/React DOM/Zustand/Lucide já são dependências do módulo/app. O teste SSR usa renderToString e não acessa window/document/localStorage na renderização inicial.

Para o smoke do navegador, opcionalmente instale ferramentas de desenvolvimento:

```bash
npm install -D playwright axe-core
npm run dev
```

Em outro terminal, com a aplicação rodando e o painel integrado:

```bash
node src/accessibility-module/tests/browser-smoke.cjs http://localhost:5173
```

O script usa Edge instalado por padrão. Se usar Chromium gerenciado pelo Playwright, instale-o e defina `PLAYWRIGHT_CHANNEL=chromium` no ambiente. `PLAYWRIGHT_MODULE_PATH` é uma opção para ambientes com biblioteca fornecida pelo runtime. São opções de teste, não configurações do produto.

Use uma origem/conta de teste e feche outros modais: o smoke altera/resetará preferências locais de acessibilidade dessa origem. Não modifica dados de negócio. Ele verifica painel/submenus por teclado/axe e persistência de 150% seguida de reset/reload em dois tamanhos. Os cenários detalhados da auditoria também devem ser repetidos manualmente no destino.

Execute ainda os comandos do aplicativo, por exemplo:

```bash
npm run typecheck
npm run build
npm run test:e2e
```

Os nomes dos scripts variam. A cópia Vite independente recebeu TypeScript estrito; houve avisos não fatais de bundling de `'use client'`/sourcemap, pois Vite ignora a diretiva específica de Next. A diretiva foi mantida para uso no Next. A primeira tentativa de build original Turbopack falhou e a primeira alternativa encontrou permissão de escrita; o build alternativo com execução permitida concluiu. Não escondemos esses resultados como se o build padrão estivesse verde.

## Checklist manual no destino

- [ ] Verificar teclado completo, foco visível e retorno em todas as rotas/modais reais.
- [ ] Conferir contraste padrão/hover/disabled e filtros em textos, ícones, botões, inputs, cards, links e modais.
- [ ] Texto até 200%, zoom nativo e reflow sem perda de informação; sidebar/navegação fixa/sticky.
- [ ] Labels, alt, erros, instruções e ordem de leitura com NVDA/VoiceOver/TalkBack reais.
- [ ] Seleção de texto, voz audível, velocidade, pausa/retomada e comportamento offline.
- [ ] Fonte efetivamente disponível no sistema e necessidades individuais do usuário.
- [ ] Animações JS, canvas, WebGL, GIFs, scrolling imperativo, loaders e conteúdo que pisca.
- [ ] VLibras ao vivo com rede/CSP, sem remontá-lo por rota.
- [ ] Unificar a preferência de texto já existente e validar migração das preferências antigas.
- [ ] Testar em dispositivos físicos e com pessoas que usam tecnologias assistivas.

Automação, axe e leitura de código ajudam a encontrar problemas. **Não constituem certificação WCAG nem substituem teste humano.**

Uma checagem adicional do exemplo Next encontrou a ausência de `use client` no hook público de movimento ao importá-lo pelo index num Server Layout. O erro foi reproduzido, corrigido na exportação e o build Next isolado repetido com sucesso. O build não inclui a aplicação remota do grupo.
