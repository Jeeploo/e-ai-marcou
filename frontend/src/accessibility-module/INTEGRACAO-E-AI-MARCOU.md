# Integração no projeto do grupo: e aí, marcou?

Repositório consultado: https://github.com/Jeeploo/e-ai-marcou
Revisão lida: `36b9adc3b936b05c804460e4b1e9517ee75134c3`, main. Se o grupo já alterou esses arquivos, preserve as mudanças e adapte os pontos equivalentes. Nenhum commit/push foi feito no projeto do grupo.

## Compatibilidade conferida

O frontend usa React 19, TypeScript, Vite 7, Tailwind 4, React Router 7 e lucide-react 0.468.0. Backend usa FastAPI/Firestore. O módulo **não precisa do banco**, nem do Supabase usado pela Ozonteck. Uma cópia independente foi compilada/testada com React 19.0.0, Vite 7.0.0 e lucide-react 0.468.0; isso não equivale a executar o projeto inteiro do grupo.

## 1. Arquivos

Copie a pasta `accessibility-module` para `frontend/src/accessibility-module`.

Na pasta `frontend`, instale apenas a dependência ausente:

```bash
npm install zustand
```

Lucide/React/Tailwind já existem na revisão consultada. Não instale Next.js, Supabase ou react-hot-toast. O módulo usa imports relativos; não precisa configurar alias `@/`.

## 2. CSS em frontend/src/main.tsx

Preserve StrictMode, BrowserRouter, registro do service worker e o restante do arquivo. Logo após `import "./index.css"`, adicione:

```tsx
import './accessibility-module/styles/accessibility.css';
```

A importação de Tailwind já existe em index.css. Confira a detecção das classes dentro de src.

## 3. frontend/src/App.tsx

A versão abaixo preserva as rotas da revisão consultada e mostra a montagem inteira. Se as rotas já mudaram, adapte somente os dois pontos marcados pelos atributos/componente:

```tsx
import { Route, Routes } from 'react-router-dom';
import AppShell from './layouts/AppShell';
import HomePage from './pages/HomePage';
import { SearchPage, NotFoundPage } from './pages/DiscoveryPages';
import { ProfessionalPage, ConfirmPage } from './pages/BookingPages';
import AgendaPage from './pages/AgendaPage';
import ProfilePage from './pages/ProfilePage';
import { ProfileProvider } from './hooks/ProfileContext';
import { CatalogProvider } from './hooks/CatalogContext';
import { AccessibilityWidget } from './accessibility-module';

export default function App() {
  return (
    <ProfileProvider>
      <CatalogProvider>
        <div data-a11y-content>
          <Routes>
            <Route element={<AppShell />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/busca" element={<SearchPage />} />
              <Route path="/profissional/:id" element={<ProfessionalPage />} />
              <Route path="/confirmar" element={<ConfirmPage />} />
              <Route path="/agenda" element={<AgendaPage />} />
              <Route path="/perfil" element={<ProfilePage />} />
              <Route path="/perfil/:section" element={<ProfilePage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </div>
        <AccessibilityWidget
          title="Preferências — e aí, marcou?"
          storageKey="marcou:a11y:v1"
        />
      </CatalogProvider>
    </ProfileProvider>
  );
}
```

O botão permanece montado entre rotas e no estado de sessão encerrada de AppShell. O widget fica fora do container filtrado e fora dos modais de negócio.

## 4. Unificar o controle de texto já existente

`ProfileContext.tsx` consultado mantém `profile.textSize: 'normal' | 'large'`, salva em `sessionStorage['marcou:profile']` e escreve `document.documentElement.dataset.textSize`. `index.css` contém `:root[data-text-size="large"] { font-size:20px }`. Se mantiver isso e o slider de 100–200% independentes, a ampliação será cumulativa.

Use a store do módulo como fonte única para esse ajuste, preservando a opção “Texto grande” do perfil. Um exemplo para o evento desse controle:

```tsx
import { useAccessibilityStore } from '../accessibility-module';

const textSize = useAccessibilityStore(state => state.textSize);
const updateValue = useAccessibilityStore(state => state.updateValue);
// No controle existente:
// checked={textSize > 100}
// onChange={event => updateValue('textSize', event.target.checked ? 125 : 100)}
```

Remova a escrita de `dataset.textSize` do efeito antigo e a regra `:root[data-text-size="large"]` quando o controle existente tiver sido conectado à store. Não apagar a opção do perfil nem os dados restantes dele. Se houver preferência antiga salva, migre normal→100/grande→125 somente quando não houver uma preferência nova já salva; a regra de migração pertence à integração do grupo. Esses ajustes do repositório remoto não foram aplicados por esta entrega.

## 5. CSS do destino e navegação

`index.css` define seletores globais `p`, headings, button e main. Confira o resultado visual, cores, altura dos controles e foco; utilitários podem perder para regras globais específicas do destino. O painel já usa dialog nativo e a contenção de foco testada, sem depender do `Modal.tsx` do destino.

Escala/filtro no conteúdo criam contexto de renderização: teste especialmente a sidebar fixa, a navegação inferior, cabeçalhos, sticky e os modais do app. O slider de texto não altera o HTML base, mas o zoom de página é um recurso distinto. Para controles fora desse container (ex.: portais), planeje a inclusão/exclusão sem colocar o painel sob filtros.

## 6. VLibras e modo offline

Se o grupo quiser:

```tsx
import VLibrasWidget from './accessibility-module/components/VLibrasWidget';
```

Monte uma vez ao lado do painel. VLibras exige internet e não será garantido pelo cache do service worker. Não reescreva a PWA para isso. O painel local pode funcionar com os assets do app em cache; voz e Libras dependem do ambiente.

## 7. Testar dentro do frontend

```bash
npm run typecheck
npm run build
npm run test:e2e
```

A revisão consultada já tem `tests/accessibility.spec.ts` com axe e teclado. Inclua o painel aberto e cada submenu nesses testes. Confira preferências, reload/reset, texto grande antigo, sessão encerrada, 320/375/1440px, paisagem, navegação inferior e zoom. Teste com teclado e leitor de tela reais; a ausência de falhas axe não certifica a aplicação.

Caso o grupo queira sincronizar conta futuramente, mantenha a arquitetura frontend → API FastAPI → serviço → repositório Firestore. O módulo atual usa armazenamento local do navegador e não deve receber Firebase Admin nem chaves administrativas.
