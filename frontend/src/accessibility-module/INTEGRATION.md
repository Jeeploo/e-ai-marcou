# Integração exata em React, Vite e Next

## React/Vite: componente e CSS

Após copiar para `src/accessibility-module`, no `src/main.tsx` mantenha o bootstrap e acrescente a importação:

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import './accessibility-module/styles/accessibility.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode><App /></StrictMode>,
);
```

Se já existir BrowserRouter ou outros providers aqui, preserve-os. Não crie um segundo root.

No `src/App.tsx`, mantenha seu conteúdo existente dentro da área identificada:

```tsx
import { AccessibilityWidget } from './accessibility-module';

export default function App() {
  return (
    <>
      <div data-a11y-content>
        <main>
          <h1>Minha aplicação</h1>
          <p>O conteúdo recebe os ajustes de apresentação.</p>
        </main>
      </div>
      <AccessibilityWidget
        title="Preferências de acessibilidade"
        storageKey="meu-projeto:a11y:v1"
      />
    </>
  );
}
```

No app real, a área contém suas rotas/componentes existentes. O exemplo é mínimo e compilável. O componente exportado é default no arquivo e named pelo `index.ts`.

## Next App Router

Se o projeto usa `src/app/layout.tsx` e o módulo foi copiado para `src/accessibility-module`:

```tsx
import type { ReactNode } from 'react';
import { AccessibilityWidget } from '../accessibility-module';
import './globals.css';
import '../accessibility-module/styles/accessibility.css';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <div data-a11y-content>{children}</div>
        <AccessibilityWidget storageKey="meu-next:a11y:v1" />
      </body>
    </html>
  );
}
```

Se usa `app/layout.tsx` na raiz, o caminho para o módulo em src será `../src/accessibility-module`. Preserve metadata/fontes/providers/navbar/footer do destino dentro da área de conteúdo conforme necessário. O widget já tem `'use client'`; o layout pode continuar Server Component. A store não lê storage na importação. Hidratação local só ocorre depois da montagem, evitando divergência inicial SSR. O exemplo com Server Layout foi compilado num app Next 16.4.3 isolado, incluindo TypeScript e geração estática, com `next build --webpack`. O hook público de movimento contém a diretiva de cliente necessária. Esse build não equivale a testar todas as telas de um app Next integrado.

## Providers, html/body, CSS e layout

- Não adicionar um AccessibilityProvider: a store Zustand já é global.
- Um widget por aplicação/origem. Não manter duas cópias da store nem dois widgets simultâneos.
- Não aplicar filtro/transform/zoom no ancestral do widget. Coloque o painel fora de `data-a11y-content`.
- O conteúdo precisa do atributo para receber efeitos de apresentação, fonte, mídia e leitura de página.
- Reservar as classes `a11y-*`, variáveis `--a11y-*`, IDs `a11y-panel`/`a11y-widget-root` para este módulo.
- Evitar duplicar o CSS da Ozonteck ou o tamanho base de fonte da origem.
- Não é necessário `suppressHydrationWarning` exclusivamente para o módulo.
- `data-a11y-ignore` exclui um trecho de leitura e da medição de texto; filtros CSS do ancestral ainda se aplicam.

## Integração de animações JavaScript

CSS não pode parar um `setInterval`/loop WebGL de outro componente. Use o hook que combina o SO com as preferências:

```tsx
import { useEffect } from 'react';
import { useAccessibilityMotion } from './accessibility-module';

export function Carousel() {
  const { pauseAnimations } = useAccessibilityMotion();
  useEffect(() => {
    if (pauseAnimations) return;
    const timer = window.setInterval(() => {
      // avançar somente a animação decorativa do carrossel
    }, 5000);
    return () => window.clearInterval(timer);
  }, [pauseAnimations]);
  return <section aria-label="Destaques">Conteúdo do carrossel</section>;
}
```

Mantenha ações de negócio e avisos importantes funcionando. Um loader pode precisar de alternativa textual. Não pausar requisições/temporizadores de negócio apenas por serem timers.

## Persistência e conta

`storageKey` separa aplicações na mesma origem. O default é `accessibility-preferences:v1`. Para memória somente:

```tsx
<AccessibilityWidget storageKey={false} />
```

A store oferece `updateValue`, `toggleProfile`, `hydrateSettings`, `resetAll`; a serialização exclui funções. `hydrateSettings` aceita entrada desconhecida e sanitiza. Números são limitados e enumerações/booleanos inválidos ignorados. Perfis são presets, não diagnósticos: combinações usam os presets na ordem da lista e os modos de cores são mutuamente exclusivos quando ativados pelas ações de perfil.

Se precisar de contas/servidor, acrescente um adaptador próprio usando `serializeA11yPreferences` e `sanitizeA11yPreferences`. Antes disso, defina carregamento, autorização, separação por usuário, logout, erros e cancelamento de gravações atrasadas. Essa integração remota está fora deste módulo e não foi inventada como pronta.

## Texto e zoom

O slider “Tamanho do texto” mede a fonte computada dos elementos com texto/formulários e aplica fator de 1 a 2 somente ao conteúdo. A medição é feita antes da escrita para evitar multiplicação em cascata. Não altera o font-size de html/body nem usa transform scale. Ao reset/desmontar, restaura os estilos inline originais. Mudanças de DOM e resize disparam remedição; alterações de tipografia apenas por classe, fontes que chegam tardiamente e CSS !important específico exigem teste no destino.

“Escala da página” é um ajuste distinto que usa CSS zoom uma única vez no container de conteúdo. Não substitui nem bloqueia o zoom nativo do navegador. Filtros/zoom do container podem afetar fixed/sticky; teste cabeçalho, navegação e modais do destino. O painel mantém tamanho próprio; o zoom nativo amplia a interface inteira.

## Personalização e erros comuns

Não manter duas preferências independentes para tamanho de fonte. Preserve os rótulos e a navegação nativa dos radios/switches. Para identidade visual, troque classes de cores com contraste verificado. Fontes próprias podem ser carregadas pelo app; OpenDyslexic não é baixada pelo módulo. Subtítulo e chave são props, não exigem editar a lógica.
