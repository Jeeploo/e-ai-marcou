# Relatório final — sistema de acessibilidade portátil

Data: 05/11/2026. Projeto de origem: Vitrine Ozonteck. Pacote: versão portátil 2.

## Resultado e classificação

**Pacote portátil: CONCLUÍDO E VALIDADO no escopo local descrito abaixo.** Código, documentação, testes e evidências foram organizados para outro desenvolvedor integrar. Isso não classifica o aplicativo inteiro como acessível nem o projeto remoto como já integrado.

**Integração no projeto do grupo: PENDENTE.** A cópia independente em React/Vite passou, mas o responsável ainda precisa montar o componente nas telas reais e unificar o ajuste de texto existente. **VLibras/voz audível/leitor de tela humano: DEPENDÊNCIA EXTERNA e PENDENTE de validação.**

## A. Como o sistema estava estruturado

Não existia um arquivo autossuficiente. O botão e o painel estavam juntos em AccessibilityWidget.tsx, que dependia de Zustand, CSS global e gerado em execução, Lucide, react-hot-toast e Supabase. O layout montava o widget, Toaster e VLibras separado. O login serializava preferências para a conta. A página sobre_cliente lia pauseAnimations e integrava isso a galeria/medalha WebGL.

Não havia Provider específico, AccessibilityPanel separado ou persistência Zustand local. A chave local antiga só era removida. Visitantes recebiam reset na montagem/logout; usuários autenticados dependiam de profiles.accessibility_settings.

Mapa completo: `AUDIT.md`. Lista de arquivos da exportação e suas funções: `FILES.md`.

## B. Arquivos encontrados

Fontes centrais: components/AccessibilityWidget.tsx, store/useAccessibilityStore.ts, app/globals.css e components/VLibrasWidget.tsx.

Integrações: app/layout.tsx, app/login/page.tsx, lib/supabase.ts, app/sobre_cliente/page.tsx, JaspeCoin.tsx e badge.module.css. Configurações: package.json, postcss.config.mjs, tsconfig.json, next.config.ts. Banco original: migrações 202609240001_ozonteck_complete_setup.sql e 202609240002_security_hardening.sql. Outras referências a ARIA/alt/foco/animações pertencem aos componentes de suas telas, não a uma dependência omitida do botão.

A tabela em `AUDIT.md` classifica cada parte em portátil/adaptável/específica e explica por que login, banco, layout e código da loja não foram incluídos.

## C. Funcionalidades existentes

Contraste/inversão/saturação/brilho/escala de cinza; opções de apoio a cores; tamanho de texto/escala da página/espaçamento/alinhamento/fontes; modo leitura; destaques de títulos/links/botões/foco; cursor; seis posições; três guias; leitura em voz alta com seleção/página/clique/velocidade/pausa/retomada/parada; silenciamento; pausa CSS/redução de movimento; ocultação visual e onze perfis. VLibras permanece separado e opcional.

`FEATURES.md` discrimina cada funcionalidade, existência, efeito real, arquivo, persistência e classificação. Não há fonte OpenDyslexic embutida, leitor de tela completo, legendas automáticas ou parada automática de qualquer animação JS.

## D. Problemas encontrados

Reproduzidos na fixture original: foco fora do modal e em submenu oculto, ausência de persistência local de visitante, fonte em px sem ampliação, zoom aplicado em html e body, muted anterior perdido, ausência de redução nativa global, updateValue sem limites em runtime e falhas de semântica identificadas por axe. A comparação original aprovou 9/19 critérios orientados à portabilidade, com autenticação simulada sem sessão; não é avaliação de todas as rotas da loja.

As matrizes de cores eram heurísticas sem algoritmo científico identificado. O texto sugeria adaptação, mas o código não sustentava uma simulação/daltonização correta. A exportação não repete essa promessa.

Na revisão independente da primeira cópia derivada apareceram reset sem cancelar voz, mídia interativa invisível e corte em tela baixa. Esses pontos foram reproduzidos e tratados. As restrições adicionais de tipografia dinâmica, filtros/fixed/sticky, múltiplas instâncias e recursos externos continuam documentadas.

## E. Correções realizadas

- Desacoplamento de Supabase/auth/banco/variáveis de ambiente e react-hot-toast; imports relativos e status no painel.
- Persistência local após montagem, validada antes da assinatura; reset salvo e falhas de storage toleradas.
- Limites de valores no runtime, deduplicação de perfis e exclusão de fontes conflitantes inclusive na hidratação parcial.
- Dialog nativo, foco modal/retorno, submenus inert, radios/switches nativos com labels/IDs, área clicável adequada e scroll em telas baixas.
- Redimensionamento de texto medido uma vez, restauração de estilos e zoom distinto no container do conteúdo, sem alterar a raiz html/body.
- Mídia com estado anterior restaurado; imagens/iframes interativos não viram controles invisíveis.
- Voz indisponível tratada; texto oculto excluído, seleção mantida, controles preservados, velocidade/pausa/parada e reset verificados com simulador.
- Classes/variáveis/efeitos limpos ao desmontar; CSS com preferências nativas e hook para integração JS, com fronteira de cliente validada por build Next isolado.
- Matrizes sem fundamento retiradas. Opções de cores preservadas como apoio estrutural comum (bordas/links/padrões), explicitamente sem alegação científica.

**Todas essas correções estão na exportação. Os arquivos originais da aplicação foram preservados.** Os problemas da implementação original não foram publicados como corrigidos no site. Registro detalhado em `CHANGELOG.md`.

## F. Estrutura do pacote

```text
accessibility-module/
├── components/
│   ├── AccessibilityWidget.tsx
│   └── VLibrasWidget.tsx
├── hooks/
│   ├── useAccessibilityEffects.ts
│   └── useAccessibilityMotion.ts
├── store/useAccessibilityStore.ts
├── styles/accessibility.css
├── index.ts
├── tests/
│   ├── store.test.cjs
│   └── browser-smoke.cjs
├── evidence/
│   ├── verification-summary.json
│   ├── original-results.json
│   ├── portable-results.json
│   ├── vite-results.json
│   ├── source-hashes.json
│   ├── painel-390.png
│   └── painel-1440.png
├── README.md
├── INSTALLATION.md
├── INTEGRATION.md
├── INTEGRACAO-E-AI-MARCOU.md
├── DEPENDENCIES.md
├── FILES.md
├── AUDIT.md
├── FEATURES.md
├── TESTING.md
├── CHANGELOG.md
├── RELATORIO-FINAL.md
└── MANIFEST-SHA256.json
```

Nenhum node_modules, build, cache, .env, credencial, código da conta/pagamentos, banco, .git ou dado de usuário faz parte da lista de entrega. Capturas são da fixture sintética. SVGs necessários estão embutidos no código.

## G. Dependências

No frontend React/Tailwind existente do grupo:

```bash
npm install zustand
```

Se Lucide não existir:

```bash
npm install lucide-react
```

React/React DOM 19, TypeScript 5 e Tailwind 4 precisam estar configurados. A cópia independente usou React 19.0.0, Vite 7.0.0, lucide-react 0.468.0, Zustand 5.0.14 e Tailwind 4.3.2. Não exige Provider adicional, Next.js, Supabase, Firebase, react-hot-toast, Three ou credenciais. VLibras/voz têm dependências externas próprias.

## H. Como integrar

1. Copiar a pasta completa para frontend/src/accessibility-module.
2. Importar o CSS depois do index.css em main.tsx.
3. Colocar o conteúdo/rotas existentes dentro de div com data-a11y-content.
4. Renderizar AccessibilityWidget uma única vez, como irmão fora desse container, com chave própria de storage.
5. Preservar providers/rotas existentes e unificar o controle de texto do ProfileContext no projeto do grupo.
6. Usar useAccessibilityMotion em animações JS do destino; VLibras opcional deve ser montado uma vez.
7. Executar checks/build e testes manuais do destino.

`INTEGRACAO-E-AI-MARCOU.md` mostra o App.tsx completo com as rotas da revisão pública consultada. `INTEGRATION.md` tem exemplos mínimos React/Vite/Next. Não há uma integração remota já aplicada ou migração de conta pronta.

## I. Testes e verificações

| Item | Resultado |
| --- | --- |
| Store/runtime/persistência/hidratação parcial/SSR | 6 testes entregues aprovados |
| Edge, fixture portátil | 31 cenários aprovados (30 na suíte + 1 de seleção/velocidade/pausa de voz) |
| Edge, build Vite independente | Os mesmos 31 cenários aprovados |
| Smoke que acompanha o ZIP | 2/2 viewports aprovados, com teclado/axe e persistência/reset |
| Axe 4.12.1 | Sem violações reportadas nos contextos do painel e cinco submenus nas execuções finais |
| Responsividade | 320, 390, 768, 1024, 1440px; telas baixas 320x568 e 740x360; seis posições |
| TypeScript e lint exportação | Sem erros; lint sem avisos |
| Build Next isolado | Server Layout + módulo: compilação, TypeScript e geração estática aprovados; fronteira de cliente corrigida após reprodução do erro |
| Build independente | tsc --noEmit + vite build concluído; avisos use client/sourcemap não fatais descritos |
| Suíte do original | 137 aprovados, 1 ignorado, 0 falhas |
| Build original alternativo | next build --webpack terminou com saída 0 |
| Build original padrão | Falha interna Turbopack no subprocesso CSS permanece registrada; não se afirma que npm run build padrão passou |
| Preservação da origem | Hashes de 11 arquivos inspecionados inalterados |

O build Vite final não possui dependência local da loja, usa cópia independente dos sete fontes entregues e não requer alias/env/backend. Os testes contemplam combinação/alternância/reset, recarga, navegação sintética, montagem/limpeza, mídia, voz simulada e preferências nativas por emulação. Capturas de painel foram inspecionadas visualmente. Não houve teste de todas as páginas reais do grupo, leitor de tela humano, dispositivo físico ou reprodução audível/VLibras remoto.

Resultados detalhados e roteiro de repetição: `TESTING.md` e `evidence/`.

## J. Arquivo final e uso

Arquivo a enviar: **sistema-acessibilidade-v2.zip**, na pasta out/compartilhar da Vitrine. Dentro dele a raiz é accessibility-module/. O ZIP é reaberto e seus arquivos/hashes e padrões de segredos conferidos na finalização. O manifesto registra os conteúdos entregues; ele não inclui seu próprio hash.

Peça ao responsável para começar pelo README, seguir INSTALLATION e INTEGRACAO-E-AI-MARCOU e executar os testes no destino. O ZIP anterior era uma cópia fiel com roteiro; esta versão é o módulo desacoplado e corrigido.

## Pendências e limites que permanecem

- **PENDENTE:** aplicar e validar a integração no repositório do grupo, inclusive tamanho de texto preexistente, navegação fixa, modais, reflow, formulários e contraste de estados reais.
- **DEPENDÊNCIA EXTERNA:** vozes do navegador/SO, VLibras/rede/CSP e tecnologia assistiva humana. Lógica de voz aprovada por simulador não é reprodução audível aprovada.
- **IMPLEMENTADO, MAS NÃO VALIDADO no destino:** hook de animações JS, uso de fontes opcionais, conteúdos tipográficos dinâmicos especiais e comportamento em outros navegadores/dispositivos.
- **PENDENTE:** diagnóstico do build padrão Turbopack no ambiente. O build alternativo passou e os fontes da acessibilidade original não mudaram.
- **Limitação preservada/documentada:** montar VLibras uma única vez; desmontar/remontar por rota pode conflitar com o marcador global do script. Não foi reescrita a integração com o fornecedor externo.

Nenhuma certificação de conformidade WCAG, eficácia clínica ou correção científica da visão de cores é atribuída ao pacote.
