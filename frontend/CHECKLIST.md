# Checklist do frontend — E aí, marcou?

Revisão do projeto: 04/10/2026. Trabalho feito na branch `frontend`.

Este documento separa o frontend implementado, as dependências do backend e as informações que a equipe ainda precisa fornecer. Um item marcado descreve a parte feita e o tipo de teste realizado; não significa que o backend real foi validado.

**Como ler a lista:** os itens com `[x]` foram feitos ou testados no frontend, como explicado ao lado. Os itens com `[ ]` ainda precisam ser concluídos. As partes que funcionam só no navegador e as dependências do backend estão separadas mais abaixo.

## Como ficou a entrega

As telas e os fluxos principais de busca e agendamento, os tratamentos de erro e a PWA estão implementados. Isso não significa que todo recurso citado no documento esteja completo: o perfil funciona localmente, algumas configurações aguardam dados da equipe e GPS, login, pagamentos, envio de notificações e publicação não foram feitos. O código foi enviado para a branch `frontend`, sem juntar as mudanças com `main` ou `backend`.

Para os testes de comunicação, foram simuladas respostas da API. Isso permitiu conferir o que a tela envia e como reage a sucesso, erro e horário ocupado. Backend: o servidor, os dados de teste e o banco precisam estar disponíveis para a validação real. Essa validação é conjunta: qualquer incompatibilidade nas chamadas ou nas telas continua sendo responsabilidade do frontend.

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
- [x] Usar 127.0.0.1:8000 no desenvolvimento — esse é o endereço padrão. Para iniciar diretamente com o backend, use npm run dev:api. Esse comando ativa a API mesmo se a configuração local estiver em modo demo.
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

## Frontend concluído dentro do escopo combinado

Além das telas e dos fluxos listados acima:

- [x] Endereços: criar, editar, excluir com confirmação e consultar CEP. Há validação de campos vazios e estado brasileiro.
- [x] Fotos: mostrar fotoUrl nos cards e no perfil; usar iniciais quando não houver foto ou a imagem falhar.
- [x] Suporte: perguntas frequentes e contato externo configurável por VITE_SUPPORT_URL, com HTTPS ou e-mail. Não foi inventado um contato da equipe.
- [x] Google Maps: mostrar o endereço do profissional selecionado e permitir abrir o mapa externamente. CEP e mapa precisam de internet, pois usam serviços externos; isso não é uma falha do backend.
- [x] Perfil: formulários de dados pessoais, preferências e endereços funcionam na sessão do navegador. A integração de perfil com o backend não está incluída neste item.
- [x] Remover convênios e planos de saúde da interface.
- [x] Facilitar o uso com o backend: npm run dev:api inicia o frontend usando as chamadas reais. npm run build:api gera a versão para a API. Ambos evitam manter dados locais por engano ao escolher esse modo.

## Dependências do backend e trabalho de frontend que depende delas

### Catálogo, horários e agendamentos

**Frontend:** as chamadas das cinco rotas estão implementadas, incluindo criação, remarcação, cancelamento, carregamento, erro, resposta 409 e bloqueio sem internet. Os testes interceptam as chamadas e verificam os dados enviados e a reação das telas.

**Backend — Jefferson:** disponibilizar o FastAPI, configurar CORS e Firestore e fornecer dados de teste válidos, incluindo paciente e horários. O backend é responsável por salvar as operações, validar preços e impedir duas reservas da mesma vaga.

- [ ] Validação conjunta com o backend real. Não é necessário criar novamente as telas. Se o contrato real tiver diferenças, o ajuste das chamadas continuará sendo uma tarefa de frontend; não deve ser repassado ao backend como se fosse exclusivamente dele.

### Dados pessoais e endereços sincronizados

**Frontend:** formulários e gerenciamento local estão prontos. Os dados ficam em sessionStorage e não acompanham uma conta em outro dispositivo.

**Backend — Jefferson:** definir e disponibilizar as rotas de consulta e alteração dos dados pessoais e endereços, com os campos aceitos e a identificação do paciente. Essas rotas não aparecem na versão da branch backend consultada nesta revisão.

- [ ] Frontend dependente do backend: depois de existir esse contrato, conectar os formulários às rotas e testar carregamento, gravação e falhas. Essas chamadas ainda não foram implementadas. Inventar rotas agora não produziria uma integração funcionando.

### Fotos e endereços das clínicas

**Frontend:** exibe as fotos e os endereços recebidos. O mapa usa o endereço disponível; se vier apenas a cidade, mostra a região.

**Backend — Jefferson:** devolver fotoUrl e os endereços completos no catálogo real. A equipe precisa fornecer fotos e endereços oficiais. Não falta criar o componente de imagem ou a tela do mapa.

## Configuração e publicação: não são pendências exclusivas do backend

- [ ] Equipe: informar um contato oficial de suporte. Depois basta preencher VITE_SUPPORT_URL e gerar o build. Isso não precisa de backend.
- [ ] Backend — Jefferson: informar um paciente de teste válido e o endereço da API. O frontend já aceita VITE_PATIENT_ID e VITE_API_URL; o endereço local padrão é http://127.0.0.1:8000. O identificador provisório não é um sistema de autenticação.
- [ ] Equipe/hospedagem: definir onde publicar e qual endereço usar. O build e as instruções estão prontos em PUBLICACAO.md, mas não foi publicado um site. Publicar arquivos estáticos é uma tarefa de frontend/hospedagem, não do backend.
- [ ] Backend — Jefferson: para usar consultas reais no site publicado, disponibilizar a API por HTTPS e liberar o domínio no CORS. Depois da publicação, o frontend precisa ser conferido no endereço definitivo.

## Recursos fora do MVP, sem marcar como tarefas concluídas

Estes recursos foram excluídos na lista original. Não são falhas no fluxo de agendamento nem tarefas que possam ser dadas como prontas apenas por desenhar uma tela.

| Recurso | Frontend | Backend e outras dependências |
|---|---|---|
| Login e autorização | Não há login. Encerrar a sessão local não autentica ninguém. Se entrar no escopo, será preciso criar e conectar a interface de login. | Backend: autenticação, sessão e permissões, ou integração com um provedor definido pela equipe. |
| Pagamento | Não há processamento financeiro. A escolha visual local não cobra. Um checkout real exigiria integração de frontend. | Backend: criar e validar cobranças e receber confirmações do provedor. Equipe: escolher o serviço e as regras. |
| Envio de notificações | Preferências locais, sem envio. Se entrar no escopo, conectar preferências; push também requer permissão e inscrição no frontend. | Backend: guardar preferências e inscrições, programar e enviar mensagens por um provedor. O Service Worker atual cuida do cache, não envia lembretes. |
| GPS e distância real | GPS não foi implementado. Pode ser feito no frontend com permissão do usuário; não é obrigação do backend. O pedido posterior de Google Maps foi atendido por endereço. | Backend: fornecer coordenadas das clínicas se houver comparação por distância. Não se deve apresentar as distâncias locais de exemplo como distâncias reais. |
| Outro backend | Não deve ser criado pelo frontend. | Backend: manter o FastAPI existente e o acesso ao Firestore. Não é uma pendência de implementação do frontend. |

## Testes e limites da confirmação

Os testes anteriores cobriram busca, navegação, horários, agendamento, remarcação, cancelamento, conflitos, estados vazios, erros, teclado, responsividade e acessibilidade automática. Foram verificadas larguras de 320 a 1440px. Os testes com respostas simuladas confirmam o comportamento do frontend; não comprovam persistência no backend.

A instalação real no Edge, abertura em janela de aplicativo e recarga offline foram verificadas anteriormente com um perfil temporário. O aplicativo de teste foi removido ao terminar. Não foi feito teste em celular físico, conforme o combinado.

Nesta revisão, a execução do modo API foi ajustada para usar o comando dev:api nos testes, inclusive com VITE_DATA_MODE=demo no ambiente, para verificar que o comando realmente usa a API. Resultado desta rodada: os 7 testes de API passaram. Os builds normal e API também passaram, incluindo a verificação de TypeScript. Os testes de layout e instalação anteriores não foram repetidos porque esta alteração não mudou as telas nem o Service Worker.

## Como executar

Dentro de frontend:

- npm install: instalar dependências.
- npm run dev: executar com a configuração local existente.
- npm run dev:api: executar com o backend; o FastAPI deve estar disponível.
- npm run build: gerar a versão com a configuração local.
- npm run build:api: gerar a versão que usa o backend.
- npm run preview: abrir a versão compilada e verificar a PWA.
- npm run test:e2e: testes de interface.
- npm run test:api: testes das chamadas e erros com respostas simuladas.

VITE_API_URL, VITE_PATIENT_ID e VITE_SUPPORT_URL são configurações públicas. Nenhuma senha ou credencial do Firebase deve ser colocada nelas ou enviada ao GitHub.

O código e este checklist ficam na branch frontend. Nenhum merge com main ou backend faz parte desta entrega.
