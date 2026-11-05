# Changelog — versão portátil 2 — 05/11/2026

## Encontrado

Widget e painel juntos, store Zustand, CSS externo e CSS gerado em runtime, Supabase no componente, salvamento no login, controles de animação em página específica e VLibras separado. Nenhum Provider próprio ou persistência local efetiva.

## Corrigido somente na versão exportada

- Dialog modal, foco/retorno, conteúdo inativo inert, rádios/switches nativos e nomes únicos com useId.
- Alvos de toque de 44px em botões/switches e área de 24px nos sliders e altura disponível com scroll interno em viewport baixo.
- Persistência local após montagem, validação/sanitização e reset salvo; tratamento de armazenamento bloqueado/corrompido.
- Atualização de valores com limites em runtime, perfis deduplicados e exclusão de fontes simultâneas, inclusive hidratação parcial.
- Escala aplicada uma vez ao conteúdo; redimensionamento de texto medido sem alterar html/body e com restauração de inline styles.
- Efeitos/classes/variáveis limpos na desmontagem, muted original preservado e mídia nova observada.
- Voz indisponível tratada, texto oculto excluído da leitura de página, controles preservados, seleção lembrada; reset e desativação cancelam fala.
- Ocultação deixa vídeo com controles, iframe e imagens de links/botões visíveis para evitar controles invisíveis.
- Preferência nativa de movimento, contraste e forced-colors; hook opcional para animações JS.

## Desacoplado/refatorado

- Removidos Supabase, SDK, variáveis de ambiente, authListener e dependência de tabela profiles da cópia exportável.
- Removida dependência de react-hot-toast; avisos em região de status do painel.
- Imports relativos, estilos em arquivo próprio, efeitos num hook e exportações em index.ts.
- Hook público de movimento marcado como Client Component após reproduzir falha de importação no Server Layout; build Next isolado passou após a correção.
- Marca do cabeçalho configurável por title; storageKey configurável ou false.
- Matrizes heurísticas de cores retiradas; opções documentadas como apoio estrutural comum, sem promessas científicas.
- Perfil de leitura deixou de ocultar imagens automaticamente; opção de fonte é chamada de alternativa para leitura. Os presets permanecem como atalhos de apresentação, não recomendações clínicas.

## Exportado

Componentes, store, hooks, CSS, dependências, instalação, integração geral/Next/Vite e específica do grupo, inventários, tabela de funcionalidades, checklist/testes, evidências selecionadas, hashes e ZIP sem segredos.

## Preservado

Família visual, menus, opções e onze perfis do sistema existente. Originais da aplicação, layout/login/banco e outras mudanças do repositório não foram editados. Não houve commit, push, publicação ou alteração no projeto remoto.

## Ainda exige validação externa

Leitor de tela humano, voz audível e VLibras remoto; integração nas telas reais do projeto do grupo; avaliação de contraste/reflow/movimento de toda a aplicação. A opção de fonte não fornece OpenDyslexic; prefere fallbacks disponíveis. VLibras deve ficar montado uma vez, não ser recriado por rota.

## Complemento solicitado pelo usuário

- Incluído `PROMPT-ORIGINAL.txt` com o pedido detalhado original, sem alterações.
- Incluído `COMECE-AQUI.md` com acesso ao relatório completo e ordem de leitura.
- README e inventário atualizados; manifesto de integridade e ZIP regenerados.
