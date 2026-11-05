# Inventário da exportação

| Arquivo | Função | Obrigatório? | Dependências | Adaptação no destino |
| --- | --- | --- | --- | --- |
| index.ts | Exportações públicas | Conveniência | Componentes/store/hooks | Caminho do import |
| components/AccessibilityWidget.tsx | Botão E painel, dialog, controles, guias e voz | Sim | React/Lucide/store/hooks/CSS | title/storageKey e montagem |
| store/useAccessibilityStore.ts | 30 preferências, ações, validação e persistência | Sim | Zustand | Chave/configuração da política local |
| hooks/useAccessibilityEffects.ts | CSS vars/classes, fonte medida e mídia/restauração | Sim | React/store/DOM | Área data-a11y-content |
| styles/accessibility.css | Estilos funcionais e preferências nativas | Sim | DOM/classes/CSS vars | Importar após CSS base; conferir conflitos |
| hooks/useAccessibilityMotion.ts | Combina SO e store para animações JS | Exportado pelo index; consumir em JS quando necessário | React/store/matchMedia | Conectar a timers/WebGL do app |
| components/VLibrasWidget.tsx | Libras remoto | Opcional | React/rede/VLibras | Uma instância persistente; CSP |
| tests/store.test.cjs | Store e SSR reproduzíveis | Só desenvolvimento | Node/TypeScript/deps do módulo | Caminho do comando |
| tests/browser-smoke.cjs | Teclado/axe/persistência/reset no app integrado | Só desenvolvimento | Playwright/axe | URL de teste e navegador |
| README.md, INSTALLATION.md, INTEGRATION.md | Entrada, instalação e exemplos de integração | Documentação | Nenhuma | Consultar |
| INTEGRACAO-E-AI-MARCOU.md | Exemplos reais para o grupo | Documentação | Revisão remota indicada | Conferir mudanças do grupo |
| AUDIT.md, FEATURES.md, CHANGELOG.md | Mapa original, funcionalidades, correções/limites | Documentação | Nenhuma | Consultar |
| TESTING.md, RELATORIO-FINAL.md | Evidências, classificação e pendências | Documentação | Nenhuma | Repetir no destino |
| evidence/* | Resultados e capturas selecionadas, hashes da origem | Evidência, não importar | Nenhuma | Não são assets do produto |
| MANIFEST-SHA256.json | Integridade dos arquivos do pacote | Verificação | Nenhuma | Não importar |

Não há arquivos externos de imagem/fonte indispensáveis. Ícone universal e cursor são SVGs embutidos. Não existem AccessibilityPanel, utilities, contexts, assets ou providers omitidos: não havia esses arquivos separados na implementação real. O painel dependia de CSS gerado e global, ambos cobertos pelo CSS/hook da exportação.

Não copiar este pacote inteiro por cima do projeto: preserve package.json, rotas, layout, CSS base e providers existentes. Não é necessário copiar a loja, login, Supabase, migrações, Three.js, imagens da medalha ou credenciais.

## Materiais de orientação adicionados

- `COMECE-AQUI.md`: link relativo e instruções para abrir o relatório completo dentro do ZIP.
- `PROMPT-ORIGINAL.txt`: cópia integral do pedido detalhado enviado pelo usuário para esta tarefa.
