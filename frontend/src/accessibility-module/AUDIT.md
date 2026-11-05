# Auditoria da implementação real e mapa de dependências

## Escopo e método

Leitura do estado atual da Vitrine em 05/11/2026, pesquisa de referências diretas/indiretas em app/components/store/lib/supabase/config/tests, inspeção do CSS e dos pontos de login/animação. Busca ampla de ARIA/foco/alt/tabIndex encontrou referências em dezenas de componentes da aplicação; esses componentes não são dependências do painel e não foram copiados. O escopo funcional é exportar o sistema existente, com avaliação prática WCAG, sem redesign ou mudança nas páginas de negócio.

Os arquivos originais inspecionados foram registrados por hash antes da extração; a conferência final está em evidence. O código de produto da origem não foi editado por esta tarefa. Mudanças preexistentes em pagamentos e artefatos foram preservadas.

## Arquitetura original real

```text
app/layout.tsx
├── importa app/globals.css
├── renderiza AccessibilityWidget uma vez
├── renderiza VLibrasWidget separadamente
└── renderiza Toaster usado por avisos do widget

components/AccessibilityWidget.tsx (arquivo único para botão E painel)
├── helpers internos: NavRow, ProfileCard, RangeSliderRow, SelectGroup, ToggleSwitch
├── store/useAccessibilityStore.ts (Zustand)
├── lib/supabase.ts → sessão + profiles.accessibility_settings
├── react-hot-toast + lucide-react
├── classes/variáveis em document.documentElement
├── CSS gerado num style#ozk-a11y-static-styles
├── filtros SVG embutidos + SVG de cursor/ícone
└── speechSynthesis + MutationObserver + eventos de mouse/teclado

app/login/page.tsx
└── serializa preferências na criação de perfil/OAuth/cadastro

app/sobre_cliente/page.tsx
├── lê pauseAnimations da mesma store
├── cancela intervalo da galeria
└── fornece paused a JaspeCoin.tsx + badge.module.css
    └── WebGL/Three e preferência nativa de movimento (específico da página)

components/VLibrasWidget.tsx
└── serviço remoto vlibras.gov.br, independente da store
```

Não há AccessibilityPanel separado na origem, nem AccessibilityProvider/context próprio. A store não tem middleware persist. A chave `ozk-a11y-preferences` era somente removida; isso não implementa salvamento local. O CSS não estava todo no globals: parte importante era montada em runtime pelo componente.

## Inventário de arquivos da origem

| Arquivo | Função | Obrigatório? | Dependências | Precisa adaptar? / classe |
| --- | --- | --- | --- | --- |
| components/AccessibilityWidget.tsx | Botão, painel, efeitos, SVGs, narração | Sim | React, store, Supabase, toast, Lucide, CSS/Tailwind | ADAPTÁVEL; derivado e corrigido |
| store/useAccessibilityStore.ts | Estado inicial, ações, presets, validação/serialização | Sim | Zustand | PORTÁTIL com correções de runtime/persistência |
| app/globals.css | Regras globais e utilitários a11y | Trechos sim | Classes do HTML e CSS vars | ADAPTÁVEL; só a parte necessária foi extraída/revista |
| app/layout.tsx | Montagem dos dois widgets e Toaster | Ponto de integração sim, arquivo não | Next e componentes da loja | ESPECÍFICO; não copiar |
| lib/supabase.ts | Cliente da conta da loja | Só salvamento remoto original | SDK + variáveis de ambiente | ESPECÍFICO; omitido intencionalmente |
| app/login/page.tsx | Serialização no cadastro/OAuth | Só conta da loja | Auth/profiles | ESPECÍFICO; não copiar |
| components/VLibrasWidget.tsx | Libras remoto | Opcional | React, rede, serviço externo | PORTÁTIL; manter uma instância |
| app/sobre_cliente/page.tsx | Integra pausa na galeria e medalha | Não para o painel | Store, componentes da página | ESPECÍFICO; usar como padrão de integração, não copiar |
| app/sobre_cliente/JaspeCoin.tsx | Animação WebGL, paused e SO | Não | Three.js, imagem própria, observer | ESPECÍFICO; hook portátil fornecido em lugar da página |
| app/sobre_cliente/badge.module.css | Animação/pausa da medalha | Não | CSS Module | ESPECÍFICO; não copiar |
| package.json | Versões reais/dependências | Referência | NPM | Não copiar inteiro; DEPENDENCIES.md lista o necessário |
| postcss.config.mjs | Tailwind da origem | Configuração equivalente sim | @tailwindcss/postcss | ADAPTÁVEL; Vite do grupo já usa plugin Tailwind |
| tsconfig.json | Alias @/ e tipos | Referência | TS/Next | Não copiar; exportação usa caminhos relativos |
| next.config.ts | Headers/CSP e configuração do site | Não | Next/ambiente | ESPECÍFICO; rede de VLibras exige política compatível no destino |
| supabase/migrations/202609240001_ozonteck_complete_setup.sql | Perfil e preferências no cadastro, permissões | Só conta original | Auth/DB/RLS e outras tabelas da loja | ESPECÍFICO; não copiar |
| supabase/migrations/202609240002_security_hardening.sql | Constraint de JSON de preferências | Só conta original | profiles e esquema de segurança | ESPECÍFICO; não copiar |
| docs/SECURITY_AUDIT_2026-09-24.md | Referência histórica de segurança | Não | Documentação | Não necessário ao módulo |

Demais referências a aria/alt/foco/timers nos componentes pertencem à acessibilidade nativa de suas telas, não a imports ocultos do widget. Por exemplo, smooth scroll em Footer, Storefront e lista; tabelas/formulários/admin; Navbar e modais de negócio. Não foram certificados nesta revisão.

## Arquitetura exportada

```text
Raiz do app
├── CSS Tailwind + styles/accessibility.css
├── div[data-a11y-content] → páginas/rotas existentes
├── AccessibilityWidget (uma instância; fora do conteúdo filtrado)
│   ├── store/useAccessibilityStore → ações/presets/validação
│   ├── startAccessibilityPersistence → localStorage após montagem
│   ├── useAccessibilityEffects → classes/CSS vars, texto/mídia com limpeza
│   ├── dialog + controles nativos + status + TTS seguro
│   └── lucide-react + SVGs embutidos
└── VLibrasWidget (opcional, rede externa)

Componentes do destino com animação JS
└── useAccessibilityMotion → store + prefers-reduced-motion
```

## Problemas reproduzidos na origem e mudanças da exportação

- Tab escapa do div declarado modal; submenus deslocados continuam focáveis. Exportação usa dialog modal e inert nos submenus.
- role menu/radio incompletos. Exportação usa fieldset/radio nativo, labels e switches de checkbox; Enter/Space/setas e nomes verificados.
- Visitante perde preferência no reload; estado remoto depende da conta. Exportação usa chave local própria, valida leitura e persiste reset sem backend.
- `updateValue` aceitava 999 apesar da tipagem; exportação limita em runtime, deduplica perfis e evita ambas fontes ativas.
- Fonte em px arbitrário não ampliava; rem podia somar fatores. Exportação mede a tipografia e aplica um fator de 1–2 no conteúdo.
- `zoom` em html e body somava fatores. Exportação aplica uma vez ao container, preserva zoom nativo e mantém painel separado.
- Efeito original reatribuía muted=false inclusive em mídia já silenciada. Exportação guarda/restaura o estado e inclui mídia nova.
- Leitura sem checar suporte e disputa de cliques. Exportação trata indisponibilidade, ignora controles/links, lê texto visível, cancela no reset/desligamento e limpa destaque.
- Redução nativa inexistente no CSS geral do widget; exportação aplica media query e oferece hook JS.
- Estilos/classes originais sem limpeza; exportação registra/restaura o que alterou.
- Revisão independente encontrou reset sem cancelar fala, mídia interativa invisível e rodapé cortado em viewport baixo na primeira versão derivada. Foram reproduzidos e corrigidos; testes específicos estão aprovados.

## Cores: original, intenção e correção

A origem usa `filter` global de contrast/invert/saturate/brightness e, para as três opções, SVG `feColorMatrix` sRGB:

- Protanopia: mantém R/G e calcula B como 0,6×R+B.
- Deuteranopia: mantém R/G e calcula B como 0,6×G+B.
- Tritanopia: calcula R como R+0,6×B e mantém G/B.

Os coeficientes podem saturar/clamp canais e não implementam modelo fisiológico identificado, espaço LMS ou método de simulação/daltonização referenciado. A intenção do texto era **adaptação**, pois dizia melhorar a percepção; a implementação demonstrável era uma transformação visual heurística. Não há evidência para apresentá-la como simulação correta ou correção científica.

Na exportação, essas matrizes foram retiradas; as opções de perfil permanecem e passam a oferecer **apoio estrutural comum**, com links sublinhados, bordas e padrões de alertas. Não simulam visão e não prometem daltonização. A opção de escala de cinza continua sendo um filtro de apresentação. Não foi introduzido um algoritmo científico novo sem validação. Contraste/inversão continuam como ajustes opcionais de apresentação, sem alegação de adequação automática WCAG.

## WCAG prática e fontes de referência

Usados como referência: [WCAG 2.2](https://www.w3.org/TR/WCAG22/), [padrão de diálogo modal WAI-ARIA](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) e [Resize Text](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html). Estado/persistência conferidos com a API Zustand 5 e [documentação oficial](https://zustand.docs.pmnd.rs/reference/integrations/persisting-store-data); esta versão usa assinatura explícita, não middleware persist.

| Princípio | Revisão/teste realizado | Limite |
| --- | --- | --- |
| Perceptível | nomes/labels/estados; axe do painel, cores e contraste nos estados padrão; texto px/rem a 200%; modos de apresentação | filtros não garantem contraste do destino; conteúdo/alt/legendas exigem revisão própria |
| Operável | Tab/Shift+Tab/Enter/Space/Escape/setas, foco modal, retorno, submenu inerte, dimensões e telas baixas | leitor de tela e toque em dispositivos físicos ainda precisam de validação |
| Compreensível | rótulos de perfis/cores mais honestos, mensagens de voz em status, reset previsível | mensagens de erro/formulários de negócio não foram auditados integralmente |
| Robusto | HTML nativo, tipos, SSR, React 19/StrictMode, axe e Vite sem backend | outros navegadores/assistivas não foram testados |

A medição de contraste do axe cobre os elementos analisados, não certifica filtros aplicados na página de destino nem todos os seus estados hover/disabled. Preferências de movimento, contraste aumentado e cores forçadas foram consideradas em CSS; JS deve consumir o hook quando aplicável.

## Limitações essenciais da aplicação

Pausar animações CSS não interrompe timers/WebGL/GIFs ou APIs de scrolling imperativo de outros componentes. Na origem, parte da página sobre_cliente já consulta a store e o SO; outras chamadas de scroll suave não demonstram essa integração. Componentes do destino devem usar o hook e preservar informações essenciais.

Não foi feita auditoria completa de checkout/admin/autenticação, contraste de todos os cards, mensagens de erro e formulários, legendas/transcrições, reflow de todas as páginas, leitor de tela ou avaliação com pessoas com deficiência. Tais pontos não podem ser solucionados somente com um widget.
