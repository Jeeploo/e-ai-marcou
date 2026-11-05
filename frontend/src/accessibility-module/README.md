# Sistema de acessibilidade — versão portátil 2

Derivado da implementação real da Vitrine Ozonteck em 05/11/2026. É uma pasta de código para integrar em um aplicativo React + TypeScript. Não é um pacote npm publicado, nem uma reescrita do sistema.

**Comece por `INSTALLATION.md`; depois leia `INTEGRATION.md`.** Para o projeto do grupo, use `INTEGRACAO-E-AI-MARCOU.md`. A auditoria, os limites e os resultados estão em `AUDIT.md`, `FEATURES.md`, `TESTING.md` e `RELATORIO-FINAL.md`.

## O que é

Um botão flutuante abre um painel de preferências com cinco seções e onze perfis de ajustes. A interface e a store foram extraídas do código existente; a integração de conta foi desacoplada. O módulo continua usando React, TypeScript, Zustand, Lucide e Tailwind.

**Não é um único arquivo.** Componente + store + efeitos + CSS + montagem na raiz formam a cadeia obrigatória. VLibras é opcional. Não há Provider extra e não são necessários Next.js, Supabase, Firebase, react-hot-toast ou credenciais para o painel funcionar.

## Funcionalidades

- Contraste, inversão, saturação, brilho e escala de cinza.
- Apoio estrutural à diferenciação de cores nas opções protanopia/deuteranopia/tritanopia.
- Texto de 100% a 200%, escala de página separada de 100% a 200%, alinhamento e espaçamentos.
- Fontes alternativas, modo de leitura, destaques de títulos, links, botões e foco.
- Cursor, seis posições de botão, guia de linha, faixa horizontal e foco com luz.
- Leitura em voz alta, velocidade, pausa/retomada/parada e silenciamento de mídia.
- Pausa de animações CSS, redução de movimento e integração opcional de animações JS por hook.
- Ocultação visual de imagens não interativas e vídeos sem controles, preservando a alternativa semântica.
- Preferências locais, restauração validada e reset persistido.
- VLibras separado e opcional.

A lista registra os recursos do código, com ressalvas em `FEATURES.md`. Os filtros não garantem contraste suficiente em qualquer página. As três opções de apoio a cores compartilham reforços de bordas/padrões/links: **não são simulação científica nem algoritmo de daltonização**. TTS não substitui leitor de tela; perfis não são recomendações clínicas.

## Requisitos e instalação

React/React DOM 19, TypeScript 5, Zustand 5, lucide-react e Tailwind 4 configurado no destino. Navegador moderno com `<dialog>` e `inert`. Validação realizada em Microsoft Edge; versões exatas em `DEPENDENCIES.md`.

No projeto de destino, se ainda não houver:

```bash
npm install zustand lucide-react
```

Copie a pasta inteira para `src/accessibility-module`. Importe o CSS e monte uma vez:

```tsx
import { AccessibilityWidget } from './accessibility-module';
import './accessibility-module/styles/accessibility.css';

export default function App() {
  return (
    <>
      <div data-a11y-content>{/* aplicação e rotas existentes */}</div>
      <AccessibilityWidget storageKey="meu-app:a11y:v1" />
    </>
  );
}
```

O exemplo ilustra os pontos de montagem; não substitua as rotas por um comentário. Há exemplos completos específicos de Vite/Next e do repositório do grupo nos guias. O painel deve ser **irmão**, fora de `data-a11y-content`, para não sofrer seus próprios filtros/zoom.

## Estrutura

```text
accessibility-module/
├── components/AccessibilityWidget.tsx
├── components/VLibrasWidget.tsx           # opcional
├── hooks/useAccessibilityEffects.ts
├── hooks/useAccessibilityMotion.ts       # útil para animações JS
├── store/useAccessibilityStore.ts
├── styles/accessibility.css
├── index.ts
├── tests/                               # checagens reproduzíveis
├── evidence/                            # resultados e imagens selecionados
└── *.md                                 # instalação, integração e auditoria
```

## Estado, persistência e reset

A store Zustand contém 30 preferências e ações. O componente inicia a persistência local após montar no cliente: lê JSON, valida e só então assina mudanças. Não usa middleware `persist`, cookies, conta ou servidor. O valor padrão é `accessibility-preferences:v1`. Passe uma chave própria; `storageKey={false}` mantém somente memória. A preferência é do navegador/origem, não de um usuário autenticado. Em dispositivo compartilhado, adote uma política própria de separação/limpeza.

```tsx
import { useAccessibilityStore } from './accessibility-module';
useAccessibilityStore.getState().resetAll();
```

O botão “Redefinir tudo” também cancela a fala e restaura defaults. Após o reset, a assinatura salva os defaults; recarregar não reativa os ajustes. Preferência nativa do SO continua sendo respeitada. Storage bloqueado/corrompido não impede os controles em memória. Não há sincronização entre dispositivos nem entre abas implementada.

## Personalização

`title` muda o subtítulo; `storageKey` escolhe a chave. Cores e aparência estão nas classes Tailwind; regras funcionais estão no CSS e hooks. Preserve nomes acessíveis, foco, `inert`, radios, labels, contratos de `data-a11y-content` e ações da store. Use `data-a11y-ignore` em trechos que não devem ser lidos ou redimensionados.

Não acrescente CSS global da loja nem copie seu layout/login. Não envolva o painel na área filtrada. O módulo deve ficar montado uma única vez numa raiz persistente.

## Limitações

Acessibilidade da aplicação continua exigindo HTML semântico, alt adequado, labels, mensagens de erro, foco, teclado, contraste, reflow, legendas e testes humanos. CSS não controla animações WebGL/JS automaticamente; use `useAccessibilityMotion`. Filtros/zoom criam contexto de renderização no conteúdo e exigem testar elementos fixed/sticky. O redimensionamento mede fontes computadas e restaura estilos ao desmontar; conteúdos/estilos dinâmicos especiais precisam de validação no destino. VLibras exige rede; voz depende do navegador/sistema.

**Não há certificação WCAG nem validação de leitor de tela nesta entrega.** A versão original do site não recebeu as correções da exportação. Nenhuma credencial, `.env`, build, cache, node_modules, banco ou dado de usuário deve acompanhar este ZIP.

## Prompt original e relatório completo

- [Consultar relatório completo](RELATORIO-FINAL.md).
- [Ler o prompt original enviado pelo usuário](PROMPT-ORIGINAL.txt).
- [Começar pela orientação de leitura](COMECE-AQUI.md).
