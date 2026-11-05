# Instalação

## 1. Copiar

Descompacte e copie `accessibility-module/` inteira para `frontend/src/accessibility-module/` (no projeto do grupo) ou `src/accessibility-module/` no seu aplicativo. As pastas components, hooks, store, styles e `index.ts` são o módulo. Documentação/tests/evidence podem ficar fora de src se desejar. Não copie apenas AccessibilityWidget.tsx.

## 2. Dependências

Na pasta que tem o package.json do frontend:

```bash
npm install zustand lucide-react
```

Se Lucide já estiver instalado, instale apenas Zustand. Não atualize bibliotecas existentes sem motivo. React 19, React DOM 19, TypeScript e Tailwind precisam existir no projeto. A validação independente usou lucide-react 0.468.0, compatível com o repositório do grupo consultado. Veja `DEPENDENCIES.md`.

## 3. CSS e Tailwind

Mantenha o Tailwind existente. Em Vite, no `src/main.tsx`:

```tsx
import './index.css';
import './accessibility-module/styles/accessibility.css';
```

Em Next App Router, no layout raiz, depois do CSS principal:

```tsx
import './globals.css';
import '../src/accessibility-module/styles/accessibility.css';
```

Ajuste o caminho caso use `src/app/layout.tsx`. O guia `INTEGRATION.md` mostra caminhos consistentes para cada organização. Não adicionar outro `@import "tailwindcss"` se o projeto já o importa.

Tailwind 4 normalmente detecta os `.tsx` dentro de src. Se o módulo ficar fora das fontes detectadas/ignorado pelo Git, registre no CSS principal um `@source` com caminho relativo ao arquivo CSS, por exemplo `@source "./accessibility-module";` quando o CSS está em src. Para Tailwind 3, incluir `./src/accessibility-module/**/*.{ts,tsx}` em `content`; essa variante não foi validada e pode exigir equivalências de utilitários do Tailwind 4. O caminho testado é Tailwind 4.

Não há tokens exclusivos da Ozonteck, plugin de animação obrigatório, arquivo de fonte ou imagem necessário. Ícone universal e cursor são SVGs embutidos. OpenDyslexic não acompanha o módulo; sem ela instalada/carregada, há fallback.

## 4. Montagem

Monte `<AccessibilityWidget />` uma vez, como irmão da área `<div data-a11y-content>`, no nível estável acima das páginas/rotas. Não precisa de Provider extra: Zustand fornece estado global. Os providers de negócio que já existem ficam preservados. Exemplos em `INTEGRATION.md`.

Nenhuma alteração manual permanente em html/body é exigida. O hook gerencia classes `a11y-*` e variáveis `--a11y-*` em html e as restaura ao desmontar. O módulo não altera o tamanho base do HTML nem aplica zoom em html/body.

## 5. Executar e conferir

Execute os comandos próprios do projeto: desenvolvimento, TypeScript, build e testes. Abra todos os submenus, use Tab/Shift+Tab/setas/Space/Enter/Escape, altere texto, recarregue e redefina. O texto de 150% deve persistir; após reset/recarga deve voltar a 100%. Veja `TESTING.md`.

Se o painel aparecer sem estilos, confira a detecção Tailwind e a ordem do CSS. Se ajustes não afetarem conteúdo, confira `data-a11y-content`. Se houver dois controles de tamanho de texto, unifique o valor antes de testar.

## 6. VLibras opcional

```tsx
import VLibrasWidget from './accessibility-module/components/VLibrasWidget';
```

Renderize uma vez na raiz, fora da área filtrada e preservando sua montagem em mudanças de rota. Ele carrega `https://vlibras.gov.br/app/vlibras-plugin.js` e `https://vlibras.gov.br/app`. Não exige uma chave do projeto. Bloqueio de rede/CSP pode impedir o funcionamento. Não foi validado com o serviço remoto nesta entrega.
