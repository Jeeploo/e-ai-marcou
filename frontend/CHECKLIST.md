# Checklist do frontend — E aí, marcou?

Revisão do projeto: 04/10/2026. Trabalho feito na branch `frontend`.

A ideia deste documento é mostrar o que ficou pronto, como cada parte funciona e o que o Jefferson precisa continuar na integração. Esta versão só muda a forma de explicar; os resultados são dos testes que já foram feitos.

**Como ler a lista:** os itens com `[x]` foram feitos ou testados no frontend, como explicado ao lado. Os itens com `[ ]` ainda precisam ser concluídos. As partes que funcionam só no navegador e as dependências do backend estão separadas mais abaixo.

## Como ficou a entrega

A parte de frontend da lista foi entregue. As telas, os fluxos, os tratamentos de erro e a PWA estão implementados. O código foi enviado para a branch `frontend`, sem juntar as mudanças com `main` ou `backend`.

Para os testes de comunicação, foram simuladas respostas da API. Isso permitiu conferir o que a tela envia e como reage a sucesso, erro e horário ocupado. O teste com o servidor e o banco reais ficou separado para o Jefferson continuar.

## Estrutura, visual e facilidade de uso

- [x] Trabalhar na branch frontend — os commits e envios foram feitos nela. Não houve merge com main ou backend.
- [x] Manter React + Vite + TypeScript + Tailwind CSS — a estrutura combinada foi mantida, com estilos compartilhados para deixar as telas consistentes.
- [x] Configurar React Router — a navegação liga início, busca, profissional, confirmação, agenda e perfil. Também há uma tela para endereço não encontrado.
- [x] Usar Lucide React — os ícones aparecem nos menus e nas ações, acompanhados de texto ou de um nome acessível.
- [x] Manter a identidade visual — foram usados verde/azul-petróleo, laranja e fundo claro. A marca ficou “E aí, marcou?”, com E maiúsculo. O laranja dos botões foi ajustado para facilitar a leitura do texto branco.
- [x] Pensar primeiro no celular — as telas se adaptam a uma coluna, com menu na parte de baixo e controles próprios para telas menores.
- [x] Adaptar para computador — há menu lateral, organização em colunas e busca com lista e mapa. Os resultados aproveitam melhor o espaço disponível.
- [x] Facilitar o uso por pessoas idosas — foram trabalhados contraste, identificação dos campos, botões com texto, áreas de toque, destaque do foco e opção de aumentar as letras. A checagem automática de acessibilidade passou nas sete telas principais, em 375 e 1440px. O PDF da disciplina citado na lista não foi conferido nesta revisão.

## Início e busca

- [x] Criar a Home — mostra a identidade do projeto, a saudação, a próxima consulta, as especialidades e os cards de profissionais.
- [x] Buscar por especialidade — dá para escolher uma categoria ou usar o filtro da busca. A pesquisa também funciona sem precisar acertar os acentos.
- [x] Mostrar os resultados — a tela informa quantos profissionais foram encontrados e permite filtrar e ordenar por preço.
- [x] Mostrar profissionais da especialidade escolhida — a lista é filtrada na interface. Quando o modo API está ativo, os dados vêm do servidor.
- [x] Mostrar as informações principais nos cards — nome, especialidade, clínica e valor aparecem no mesmo padrão, usando o componente DoctorCard.
- [x] Criar a página do profissional — cada profissional tem uma tela com suas informações e a escolha de data e horário.
- [x] Mostrar CRM, especialidade, clínica, endereço e valor — a tela usa os campos recebidos da API. Quando falta alguma informação, orienta consultar a clínica. Os dados do modo local são referências para testar a interface.
- [x] Escolher a data — há botões para os próximos dias e um campo para selecionar outra data.
- [x] Buscar os horários daquele profissional e dia — a chamada envia profissionalId e data. Esses parâmetros foram conferidos nos testes com respostas simuladas.
- [x] Bloquear horários indisponíveis — eles aparecem desabilitados e identificados. A confirmação final da vaga continua sendo feita pelo servidor.

## Agendamento

- [x] Conferir antes de agendar — o usuário passa por uma tela de resumo antes de confirmar.
- [x] Mostrar o resumo completo — aparecem profissional, especialidade, clínica, data, hora e valor.
- [x] Ligar o botão Agendar à API — a chamada POST está pronta e foi testada com resposta simulada. A parte de usar o servidor real está nas ressalvas de integração.
- [x] Enviar somente pacienteId e horarioId — o teste confere que o pedido contém apenas esses dois campos.
- [x] Deixar os dados confiáveis com o backend — preço, profissional, clínica, data e hora não são enviados como valores que o servidor deve aceitar. Ele encontra essas informações a partir do horário.
- [x] Mostrar a confirmação — depois do sucesso, abre uma janela com o resumo. No modo local, o texto explica que a solicitação foi salva no dispositivo e ainda precisa ser confirmada com a clínica.
- [x] Tratar horário ocupado, erro 409 — a tela avisa que outra pessoa ocupou o horário e pede uma nova escolha. Esse retorno foi testado.
- [x] Atualizar os horários — ao voltar à seleção, a lista é buscada novamente. No modo local, os horários consideram os agendamentos salvos no navegador.

## Agenda, remarcação e cancelamento

- [x] Criar Meus Agendamentos — a tela aparece como “Minhas consultas”, dividida entre próximas consultas e histórico.
- [x] Listar as consultas do paciente — a chamada usa pacienteId. Ela foi conferida com resposta simulada. Esse identificador ainda é configurado de forma provisória, pois não há login no MVP.
- [x] Diferenciar agendada e cancelada — a situação aparece por escrito e com destaque visual. Consultas canceladas ficam no histórico.
- [x] Abrir os detalhes da consulta — dá para conferir os dados da consulta e as informações disponíveis do profissional e da clínica.
- [x] Criar o botão Reagendar — na tela, a ação se chama “Remarcar” e leva à escolha de outro horário.
- [x] Escolher um novo horário — o usuário segue pela seleção de data e horário, mantendo a referência da consulta que está sendo alterada.
- [x] Enviar somente novoHorarioId — a remarcação usa PATCH em /api/agendamentos/{id}/reagendar. O teste verifica esse único campo no pedido.
- [x] Mostrar a remarcação na agenda — depois do sucesso, a agenda é carregada novamente e mostra o novo horário.
- [x] Tratar 409 na remarcação — se a vaga for ocupada, a seleção é limpa e a confirmação fica bloqueada até escolher outro horário. O cenário foi testado também na remarcação.
- [x] Criar o botão Cancelar — ele aparece nas consultas futuras que ainda estão ativas.
- [x] Pedir confirmação antes de cancelar — uma janela pergunta se o usuário quer mesmo cancelar. É possível voltar ou apertar Escape para desistir.
- [x] Atualizar a tela após cancelar — a consulta sai das próximas e aparece a mensagem de sucesso. A atualização visual não depende de uma segunda chamada terminar sem erro.
- [x] Manter a consulta no histórico — o frontend usa a rota de cancelamento do backend. No modo local, muda a situação para cancelada, sem apagar o registro. Os dois caminhos foram testados, sendo o da API com resposta simulada.

## Comunicação com o FastAPI

- [x] Centralizar as chamadas — catálogo, horários e agendamentos ficam em src/services/api.ts.
- [x] Evitar fetch espalhado — as telas chamam os serviços. A busca de CEP fica separada em src/services/postal.ts.
- [x] Configurar VITE_API_URL — o endereço da API pode ser definido pela configuração de ambiente, sem colocar credenciais no código.
- [x] Usar 127.0.0.1:8000 no desenvolvimento — esse é o endereço padrão. Para usar o servidor, é preciso ativar VITE_DATA_MODE=api.
- [x] Consumir /api/especialidades — a chamada busca os nomes e identificadores das especialidades.
- [x] Consumir /api/clinicas — a chamada busca os dados das clínicas, incluindo endereço, cidade e estado.
- [x] Consumir /api/profissionais — a chamada busca os profissionais ativos e os valores das consultas.
- [x] Consumir /api/horarios — a chamada busca horários usando o profissional e a data escolhidos.
- [x] Consumir /api/agendamentos — as chamadas permitem listar, criar, remarcar e cancelar consultas.
- [x] Usar os filtros disponíveis no backend — são usados pacienteId, profissionalId e data. Quando a rota de profissionais não oferece um filtro, a busca faz essa filtragem na própria interface.

## Componentes e mensagens da tela

- [x] Reaproveitar componentes — cards, busca, janelas de confirmação e estrutura das páginas usam DoctorCard, SearchField, Modal e AppShell. Botões, campos e mensagens compartilham estilos; nem todo elemento tem um componente separado.
- [x] Mostrar que está carregando — enquanto aguarda catálogo, horários ou confirmação, a tela informa o que está acontecendo.
- [x] Mostrar erros de forma clara — quando a chamada falha, aparece uma mensagem compreensível e, onde cabe, um botão para tentar novamente.
- [x] Avisar quando não há dados — a interface trata busca sem resultados, agenda vazia e ausência de horários.
- [x] Confirmar ações bem-sucedidas — agendamento, remarcação e cancelamento têm mensagem ou janela de sucesso.
- [x] Evitar envio repetido — o botão fica desabilitado enquanto a operação está em andamento.
- [x] Não mostrar erro técnico para o usuário — detalhes internos e stack traces são substituídos por mensagens úteis.

## Cuidados com o código e com o escopo

- [x] Não colocar credenciais Firebase no frontend — nenhuma foi adicionada.
- [x] Não usar Firebase Admin SDK no frontend — essa dependência não faz parte da interface.
- [x] Não acessar o Firestore diretamente — no modo API, as operações passam pelo FastAPI.
- [x] Não refazer as regras do servidor — no modo API, reserva de vaga, preço e cancelamento ficam com o backend. O modo local apenas simula o fluxo para permitir testar as telas.
- [x] Não criar outro backend — foi usada a API prevista para o projeto. As respostas simuladas existem apenas para os testes.
- [x] Não implementar autenticação agora — login ficou fora do MVP. Encerrar a sessão local não equivale a sair de uma conta autenticada.
- [x] Não implementar pagamento — não há cobrança nem integração financeira. A escolha de pagamento no modo local é só uma preferência visual.
- [x] Ajustar o pedido sobre mapas — a lista inicial excluía mapas, mas depois foi pedido o Google Maps. Ele foi incluído; GPS e permissão de localização não foram implementados.
- [x] Não enviar notificações — a tela guarda preferências locais, mas não dispara SMS, WhatsApp, e-mail ou push.
- [x] Priorizar o fluxo principal — a entrega foi organizada em busca, profissional, horário, confirmação e agenda. Os limites dos recursos extras estão explicados abaixo.

## PWA e uso sem internet

- [x] Criar manifest.webmanifest — o arquivo está na pasta public e entra na versão compilada do site.
- [x] Configurar o nome — ficou “E aí, marcou?”, com o E maiúsculo solicitado.
- [x] Configurar short_name — o nome curto também está definido no manifesto.
- [x] Configurar os ícones — foram incluídas imagens PNG de 192 e 512 pixels. A de 512 também está marcada para adaptação ao formato do ícone do dispositivo.
- [x] Configurar theme_color — usa o verde #123b3a.
- [x] Configurar background_color — usa o fundo claro #f7f9fb.
- [x] Configurar display: standalone — permite abrir o site instalado em uma janela de aplicativo. Esse modo foi testado.
- [x] Implementar o Service Worker — ele é gerado no build e registrado na versão de produção.
- [x] Guardar a estrutura básica em cache — HTML, CSS, JavaScript, manifesto e ícones ficam disponíveis para abrir o aplicativo sem conexão. O cache tem uma versão para controlar as atualizações.
- [x] Abrir a estrutura offline — depois de um primeiro acesso com internet, a página foi recarregada sem conexão e continuou abrindo.
- [x] Perceber quando está offline — o aviso e os controles mudam quando a conexão cai ou volta.
- [x] Explicar quando precisa de internet — ações como agendar e consultar o mapa orientam o usuário a se reconectar.
- [x] Não agendar, remarcar ou cancelar offline — essas ações ficam bloqueadas na tela e no serviço. Não há uma fila escondida para enviar depois.
- [x] Permitir instalar a PWA — o Edge não apontou impedimentos. O aplicativo foi instalado em um perfil de teste, aberto em janela independente e recarregado offline. Para um endereço público, é necessário HTTPS; os testes usaram localhost.
- [x] Testar manifesto, Service Worker e offline — os testes passaram na versão compilada. O mapa e os dados da API não fazem parte do cache da estrutura básica.

## Testes e envio para o GitHub

- [x] Testar em larguras de celular — foram usados 320, 375 e 430px. Não houve conteúdo passando da largura da tela nos caminhos testados.
- [x] Testar em tablet e desktop — foram usados 768, 1024 e 1440px. Também houve revisão visual em 375 e 1440px.
- [x] Testar a navegação — foram conferidos os caminhos principais, o perfil e a volta à busca mantendo os filtros. Isso cobre os trajetos testados, não toda combinação possível de uso.
- [ ] Testar com a API real — ficou separado para a continuidade da integração. O frontend já foi testado com respostas simuladas; o que falta está explicado na seção do Jefferson.
- [x] Testar a busca de especialidade — foram conferidos o filtro e a preservação da escolha ao voltar.
- [x] Testar a escolha do profissional — a navegação até os detalhes e a exibição dos dados foram verificadas.
- [x] Testar horários — foram conferidos a seleção, o bloqueio dos indisponíveis e os parâmetros enviados na chamada.
- [x] Testar agendamento — passaram o fluxo local e a chamada com resposta simulada.
- [x] Testar remarcação — passaram o fluxo local e a chamada PATCH simulada, com o novo horário aparecendo na agenda.
- [x] Testar cancelamento — passaram o fluxo local e a chamada DELETE simulada, mantendo a consulta no histórico.
- [x] Testar horário ocupado, erro 409 — foram testados o conflito entre abas no modo local e respostas 409 simuladas. A disputa por vaga no banco real fica com a integração.
- [x] Testar sem internet — foram conferidos abertura, aviso, bloqueio de envio e liberação das ações quando a conexão volta.
- [x] Testar a instalação — a PWA foi instalada no Edge, aberta como aplicativo e recarregada offline. O teste está em tests/pwa-install.cjs. Teste em celular físico não foi definido como obrigação desta entrega.
- [x] Rodar npm run build — a compilação de TypeScript e Vite passou depois dos ajustes.
- [x] Conferir erros do navegador — não foram encontrados erros JavaScript sem tratamento nas telas da inspeção. Isso se refere aos cenários que foram verificados.
- [x] Organizar os commits — a revisão inicial ficou em a7924a5, e as correções finais em b0c7ea9. O checklist foi salvo em um commit separado.
- [x] Enviar para origin/frontend — os commits a7924a5 e b0c7ea9 e o checklist em 7ea1411 foram enviados. Não houve merge com main ou backend.
- [x] Avisar antes de merge — nenhum merge foi feito nesta entrega.

## Outros ajustes que foram pedidos

- [x] Colocar Google Maps — o mapa carregou na revisão visual, permite escolher o profissional e tem um link para abrir fora do site. Esse pedido substituiu a restrição inicial de não usar mapas.
- [x] Corrigir a marca — foi mantida a logo criada no próprio frontend, com “E aí, marcou?” e E maiúsculo. Não foi preciso criar uma nova imagem.
- [x] Melhorar o espaço da busca — os resultados ficaram organizados em linhas no desktop e o mapa acompanha a rolagem. No celular, os controles foram adaptados.
- [x] Buscar endereço pelo CEP — o botão consulta o ViaCEP, preenche os campos e deixa o usuário corrigir o que precisar. Há mensagens para CEP inválido, inexistente, falha de conexão ou demora na resposta. O preenchimento foi testado com uma resposta simulada.
- [x] Corrigir os últimos detalhes dos fluxos — abrir a confirmação por link agora aguarda o catálogo; uma data inválida não quebra a página; o erro 409 limpa a seleção; o teclado continua dentro da janela aberta; os detalhes mostram os dados disponíveis da clínica.

## O que fica para o Jefferson continuar na integração

As telas e as chamadas já estão prontas. Estes são os passos que faltam para conferir o funcionamento com os dados reais do projeto.

- [ ] Testar o fluxo completo com a API real — carregar o catálogo, buscar horários, agendar, remarcar, cancelar e conferir o histórico. Na última verificação, o FastAPI não estava disponível em 127.0.0.1:8000.
- [ ] Conferir o banco e a disputa por horários — verificar se cada operação salva corretamente e se duas pessoas tentando a mesma vaga recebem o resultado esperado. O frontend já sabe mostrar a mensagem de horário ocupado.
- [ ] Ativar o modo API — configurar VITE_DATA_MODE=api, VITE_API_URL e um VITE_PATIENT_ID válido. A configuração padrão ainda usa dados locais, que não são agendamentos reais.
- [ ] Preparar os dados de teste — deixar o FastAPI acessível, permitir a conexão do frontend pelo CORS e ter paciente, especialidades, clínicas, profissionais e horários cadastrados. As credenciais do banco ficam só no backend.

## O que funciona só em parte ou depende de outro serviço

- **Dados pessoais e endereços:** os formulários funcionam, mas salvam na sessão do navegador, em sessionStorage. Ainda não sincronizam com uma conta ou outro dispositivo. Para isso, precisam das rotas do backend e de um acordo sobre os dados enviados.
- **Mapa:** usa o endereço que estiver cadastrado. Se houver apenas “São Paulo/SP”, mostra a região. Para apontar o local certo, precisa do endereço completo. Não calcula distância real nem mostra vários marcadores sincronizados.
- **Preferências de notificações:** as escolhas são salvas localmente. Nenhuma mensagem é enviada, como combinado para o MVP.
- **Suporte:** as perguntas frequentes funcionam. O botão de contato externo depende de a equipe informar um canal de atendimento.
- **Fotos dos profissionais:** são usadas iniciais no lugar das fotos. Fotografias reais não foram incluídas.
- **CEP e mapa:** precisam de internet e dos serviços externos funcionando. Eles não fazem parte do uso offline da PWA.

## O que não foi feito porque ficou fora do combinado

- **Login e autorização:** não foram implementados no MVP. Encerrar a sessão local não é um sistema de login.
- **Pagamento:** não há cobrança, integração com gateway ou processamento financeiro. A escolha visual é apenas uma preferência.
- **Envio de notificações:** o site não envia SMS, WhatsApp, e-mail ou push.
- **GPS:** o site não pede a localização do dispositivo.
- **Outro backend:** não foi criado. O frontend segue a API FastAPI do projeto.
- **Publicar o site:** a entrega não incluiu colocar o aplicativo em um endereço público. Enviar o código ao GitHub não publica o site automaticamente.

Essas funções não ficam como tarefas atrasadas do frontend. Elas estavam fora do escopo desta entrega.

## Resultado dos testes já feitos

- O build de TypeScript e Vite passou.
- Na revisão final, passaram 16 testes de fluxos e acessibilidade, incluindo teclado e janelas de confirmação.
- Os três testes anteriores de CEP, mapa e inspeção também passaram na revisão em que foram executados. Não foram repetidos sem uma mudança que justificasse isso.
- Passaram 6 testes de comunicação e erros: criação, remarcação com 409, cancelamento com falha e nova tentativa, catálogo com falha, horários vazios, falta de internet, bloqueio durante envio e confirmação aberta por link.
- A checagem automática Axe, com regras WCAG A/AA, não encontrou violações nas sete telas avaliadas em duas larguras.
- A instalação no Edge, a abertura em janela independente e a recarga offline passaram. Ao terminar, o aplicativo criado no perfil de teste foi removido.
- O teste com a API real ficou pendente porque a porta 8000 não estava disponível na última verificação.

## Como abrir e conferir

Dentro da pasta frontend, os comandos são:

- `npm install` para instalar as dependências.
- `npm run dev` para abrir a versão de desenvolvimento.
- `npm run build` para gerar a versão compilada.
- `npm run preview` para visualizar essa versão e conferir a PWA.
- `npm run test:e2e` para executar os testes de interface.
- `npm run test:api` para executar os testes com respostas simuladas da API.

O terminal informa o endereço para abrir no navegador. O Service Worker funciona na versão compilada.

Para testar a instalação, deixe a prévia rodando em http://127.0.0.1:4173 e execute `node tests/pwa-install.cjs` dentro de frontend. Ele usa um perfil temporário do Edge, instala a PWA, abre como aplicativo, recarrega offline e remove somente o aplicativo criado nesse teste.

Para ligar aos dados reais, configure `VITE_DATA_MODE=api`, `VITE_API_URL=http://127.0.0.1:8000` e um `VITE_PATIENT_ID` válido. Depois, reinicie o Vite com o FastAPI e os dados de teste disponíveis. Nenhuma credencial Firebase deve ir para o frontend.

## Onde ficaram as principais mudanças

Os caminhos abaixo partem da pasta frontend:

- Busca e mapa: src/pages/DiscoveryPages.tsx.
- Marca: src/layouts/AppShell.tsx, index.html e public/manifest.webmanifest.
- Layout e contraste: src/index.css.
- CEP e perfil: src/services/postal.ts e src/pages/ProfilePage.tsx.
- Confirmação e agenda: src/pages/BookingPages.tsx e src/pages/AgendaPage.tsx.
- Janelas e navegação por teclado: src/components/Modal.tsx.
- Testes: tests/accessibility.spec.ts, tests/flows.spec.ts, tests/review.spec.ts, tests/api.spec.ts e tests/pwa-install.cjs.
- Configuração dos testes: playwright.config.ts e playwright.api.config.ts.
- Dependências: package.json e package-lock.json.
- Checklist do projeto: CHECKLIST.md, com o que foi feito, os testes e as partes que precisam de continuidade na integração.
