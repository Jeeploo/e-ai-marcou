# Checklist do frontend — E aí, marcou?

Revisão: 04/10/2026. Branch: `frontend`. Escopo: alterações somente no frontend; backend local preservado.

**Como ler:** `[x]` significa implementado no frontend e/ou verificado conforme a explicação. `[ ]` significa pendência ou validação parcial. Um item implementado que consome API continua dependendo de um FastAPI disponível para funcionar com dados reais. Os testes HTTP abaixo interceptam respostas no navegador: não são testes de Firestore.

**Situação importante:** a configuração padrão ainda usa dados locais (`VITE_DATA_MODE=demo`). As mensagens de “demonstração” foram removidas a pedido, mas isso não transforma os dados em dados reais. No modo API (`VITE_DATA_MODE=api`), catálogo e consultas passam pelo FastAPI. O servidor em `127.0.0.1:8000` não estava disponível nesta revisão. Não declarar o sistema integrado em produção ou consultas confirmadas pela clínica no modo local.

## Base, identidade e acessibilidade

- [x] Trabalhar na branch frontend — branch atual e destino dos commits; main e backend não receberam merge.
- [x] React + Vite + TypeScript + Tailwind CSS — dependências e plugin Tailwind mantidos; estilos compartilhados no CSS.
- [x] React Router — rotas de início, busca, profissional, confirmação, agenda, perfil e página não encontrada.
- [x] Lucide React — ícones de navegação e ações, com texto ou nome acessível.
- [x] Identidade verde/azul-petróleo, laranja e fundo claro — preservada; marca agora escreve “E aí, marcou?”. Laranja dos botões escurecido para contraste com branco.
- [x] Mobile-first — navegação inferior, controles adaptados e layouts de uma coluna no celular.
- [x] Desktop — barra lateral, grades e disposição de busca com mapa; resultados ocupam linhas em vez de deixarem uma faixa vazia abaixo do carrossel.
- [x] Acessibilidade para idosos — foco visível, link para pular ao conteúdo, campos rotulados, texto ampliável, botões com texto e correção de contraste. Auditoria automática WCAG A/AA nas sete telas principais em 375 e 1440px passou. Não equivale a certificação ou teste com usuários/leitor de tela. O PDF da disciplina não estava disponível para conferir seus critérios específicos.

## Início e busca

- [x] Home com identidade e início da busca — saudação, próxima consulta, especialidades e cards.
- [x] Seleção/busca de especialidade — seleção por categoria e filtro na busca; comparação sem diferença de acentos.
- [x] Tela de resultados — quantidade, filtros, ordenação por preço e estado vazio.
- [x] Profissionais por especialidade — catálogo filtrado no frontend; no modo API o catálogo é carregado do servidor.
- [x] Cards com nome, especialidade, clínica e valor — componente DoctorCard reutilizado.
- [x] Detalhes do profissional — rota dedicada com informações e seleção de horário.
- [x] CRM, especialidade, clínica, endereço e valor — campos da API associados ao profissional/clínica; dados ausentes não são inventados. Dados locais de referência não comprovam cadastro real.
- [x] Seleção de data — dias próximos e campo de data.
- [x] Buscar horários por profissional/data — consulta ao endpoint de horários no modo API; parâmetros testados com interceptação HTTP.
- [x] Horário indisponível não selecionável — botão desabilitado e identificação textual; servidor continua responsável pela disponibilidade final.

## Agendamento

- [x] Confirmação antes de agendar — tela de revisão da consulta.
- [x] Resumo completo — profissional, especialidade, clínica, data, hora e valor.
- [x] Botão Agendar conectado à camada de API — POST implementado e testado com resposta simulada. A efetivação real depende do FastAPI e de dados válidos.
- [x] Criar enviando somente pacienteId e horarioId — teste verifica exatamente as duas propriedades do corpo HTTP.
- [x] Não enviar preço, profissional, clínica, data/hora como dados confiáveis — esses campos não entram no POST; o backend os deriva.
- [x] Confirmação visual — modal após sucesso; modo local informa que foi salvo no dispositivo e que ainda exige confirmação com a clínica.
- [x] Tratar 409 no agendamento — mensagem amigável para escolher outro horário; resposta HTTP 409 exercitada no teste de contrato.
- [x] Atualizar horários após agendar — ao voltar à seleção os horários são buscados novamente; no modo local a disponibilidade considera os registros locais.

## Agenda, remarcação e cancelamento

- [x] Tela Meus Agendamentos — interface “Minhas consultas”, com próximas e histórico.
- [x] Listar agendamentos do paciente — GET com pacienteId; cenário HTTP simulado testado. O ID configurado é provisório, sem autenticação.
- [x] Diferenciar agendado/cancelado — status textual e visual; cancelados vão para o histórico.
- [x] Ver detalhes — consulta pode ser aberta para revisão das informações.
- [x] Botão Reagendar — ação “Remarcar” abre a escolha de horário.
- [x] Escolher novo horário — mesmo fluxo de seleção com o identificador da consulta.
- [x] Enviar somente novoHorarioId — PATCH /api/agendamentos/{id}/reagendar; corpo verificado no teste HTTP.
- [x] Atualizar interface após reagendar — agenda carregada novamente e novo horário mostrado; fluxo testado.
- [x] Tratar 409 na remarcação — tratamento compartilhado na camada de API e mensagem na confirmação. O teste HTTP desta revisão exercitou 409 na criação, não uma disputa real de remarcação.
- [x] Botão Cancelar — disponível em consulta futura ativa.
- [x] Confirmação antes de cancelar — modal; Escape e voltar permitem desistir.
- [x] Atualizar após cancelar — sucesso informado e consulta retirada das próximas.
- [x] Preservar histórico cancelado — DELETE chama cancelamento lógico do backend; modo local altera status, não apaga registro. Testado no fluxo local e HTTP simulado.

## Comunicação com FastAPI

- [x] Camada central — src/services/api.ts concentra catálogo, horários e agendamentos.
- [x] Evitar fetch espalhado — componentes utilizam serviços; consulta de CEP isolada em src/services/postal.ts.
- [x] VITE_API_URL — documentada no arquivo de exemplo de ambiente, sem credenciais.
- [x] Endereço de desenvolvimento 127.0.0.1:8000 — valor padrão da camada API; exige VITE_DATA_MODE=api para utilizá-lo.
- [x] /api/especialidades — carrega nomes/IDs do catálogo.
- [x] /api/clinicas — associa nome/endereço/cidade/UF aos profissionais.
- [x] /api/profissionais — carrega profissionais ativos e valor da consulta.
- [x] /api/horarios — filtra por profissionalId e data.
- [x] /api/agendamentos — lista, cria, cancela e remarca pelos métodos próprios.
- [x] Filtros/query parameters do backend — pacienteId, profissionalId e data usados; filtros da busca permanecem locais quando o endpoint de profissionais não os oferece.

## Estados e componentes

- [x] Componentes reutilizáveis — DoctorCard, SearchField, Modal, AppShell e estilos compartilhados de botões/campos/mensagens; não há um componente independente para cada classe visual.
- [x] Carregamento — mensagens enquanto catálogo, horários e confirmação aguardam resposta.
- [x] Erro de API — mensagem amigável e opção de tentar novamente onde aplicável.
- [x] Estado vazio — busca sem resultados, agenda vazia e horário indisponível.
- [x] Sucesso ao agendar/reagendar/cancelar — modal ou mensagem de estado após a operação.
- [x] Impedir duplo envio — botão desabilitado durante a operação.
- [x] Não mostrar erros técnicos crus — tratamento central evita stack trace e texto interno de respostas na interface.

## Limites de escopo e segurança

- [x] Sem credenciais Firebase no frontend — não foram adicionadas.
- [x] Sem Firebase Admin SDK no frontend — dependências da interface não o incluem.
- [x] Sem acesso direto ao Firestore — operações reais passam por REST/FastAPI.
- [x] Não duplicar regras do FastAPI no modo API — reserva, preço e cancelamento confiáveis são do servidor. O modo local possui simulação de disponibilidade para desenvolvimento, que não substitui a regra do backend.
- [x] Não criar outro backend — nenhuma API nova foi criada nesta revisão; interceptações só existem nos testes.
- [x] Sem autenticação real — mantido fora do MVP; a opção de encerrar sessão do perfil não representa login seguro.
- [x] Sem pagamento real — escolha visual de preferência no modo local; sem cobrança ou gateway.
- [ ] Não implementar mapas/geolocalização — requisito alterado pelo pedido posterior: Google Maps incorporado foi adicionado. GPS/permissão de localização não foi implementado.
- [x] Sem envio de notificações — tela guarda preferências locais; não envia SMS, push, e-mail ou WhatsApp.
- [x] Priorizar fluxo principal — mantidos busca → profissional → horário → confirmação → agenda; recursos avançados do fluxograma seguem separados abaixo.

## PWA e offline

- [x] manifest.webmanifest — disponível em public e incluído na compilação.
- [x] Nome da aplicação — “E aí, marcou?”, com maiúscula solicitada.
- [x] short_name — configurado no manifesto.
- [x] Ícones — PNG de 192 e 512 pixels; 512 também declarado maskable.
- [x] theme_color — verde #123b3a.
- [x] background_color — claro #f7f9fb.
- [x] display standalone — configurado e conferido em teste.
- [x] Service Worker — gerado na compilação e registrado em produção.
- [x] Cache do App Shell — HTML, CSS, JavaScript, manifesto e ícones; cache versionado.
- [x] Estrutura abre offline — recarga sem internet exercitada após o primeiro carregamento online.
- [x] Detectar offline — eventos de conectividade atualizam aviso e controles.
- [x] Mensagem amigável para ações online — agendamento e mapa orientam reconectar.
- [x] Sem agendar/reagendar/cancelar offline — bloqueio na interface e no serviço; sem fila silenciosa de operações.
- [x] Critérios técnicos de instalação — Edge em perfil normal retornou zero impedimentos e comando de instalação foi aceito em perfil temporário. HTTPS continua necessário no endereço público; localhost foi usado nos testes.
- [x] Manifesto, Service Worker e offline testados — testes automatizados da compilação de produção passaram. O mapa externo e dados da API não são armazenados pelo App Shell.

## Validação e entrega

- [x] Larguras de celular — 320, 375 e 430px, sem transbordamento horizontal nos trajetos testados.
- [x] Desktop/tablet — 768, 1024 e 1440px; revisão visual adicional em 375 e 1440px.
- [x] Navegação entre telas — rotas principais, perfil e retorno com filtros testados; não representa cobertura de toda combinação de estado.
- [ ] Integração com API real — pendente: FastAPI não estava acessível em 127.0.0.1:8000. Contratos HTTP simulados passaram; Firestore não foi testado.
- [x] Busca de especialidade — filtro e retorno preservado testados.
- [x] Escolha de profissional — navegação aos detalhes e dados exibidos testados.
- [x] Horários — escolha e horário indisponível testados; parâmetros HTTP conferidos.
- [x] Agendamento — fluxo local e requisição HTTP simulada testados; confirmação real depende do backend.
- [x] Reagendamento — fluxo local e PATCH simulado testados; novo horário refletido na agenda.
- [x] Cancelamento — fluxo local e DELETE simulado testados; histórico preservado.
- [x] Horário ocupado 409 — conflito entre abas no modo local e resposta HTTP 409 simulada testados. Concorrência real no banco ainda pendente.
- [x] Sem internet — recarga, aviso, bloqueio de envio e reativação ao reconectar testados.
- [ ] Instalação completa da PWA — instalação aceita no perfil temporário, mas a abertura via PWA.launch expirou no Edge automatizado. Falta validar abrir a janela instalada e instalar em aparelho físico.
- [x] npm run build — compilação TypeScript/Vite passou após as alterações.
- [x] Erros relevantes do navegador — nenhum erro JavaScript não tratado capturado nas rotas da inspeção; não é garantia para todas as redes/provedores externos.
- [x] Commits organizados — entrega anterior já versionada; revisão de código registrada no commit a7924a5; checklist em commit separado.
- [x] Push da revisão de código para origin/frontend — envio do commit a7924a5 confirmado; sem merge com main/backend.
- [x] Avisar antes de merge — nenhum merge com main/backend realizado nesta entrega.

## Pedidos adicionais e dependências

- Google Maps: incorporado e carregamento visual confirmado, com escolha do profissional e link externo. A localização usa o endereço cadastrado; no catálogo local alguns registros só têm São Paulo/SP e, por isso, mostram a região. Endereços completos/validados dependem do cadastro do backend. Não há cálculo real de distância, geolocalização, rota interna ou vários marcadores sincronizados.
- A incorporação atual usa o mapa público do Google. A modalidade oficial Maps Embed API com chave pode ser configurada numa evolução, com chave restrita ao domínio; ela não foi provisionada nesta entrega. Referência: https://developers.google.com/maps/documentation/embed/embedding-map
- Logo: composição vetorial existente mantida, sem depender de fotografia, agora com E maiúsculo. Não foi necessária uma imagem raster nova.
- CEP: serviço ViaCEP consultado ao clicar “Buscar CEP”; valida oito dígitos, trata inexistência, timeout e offline e mantém edição manual. Teste de preenchimento usa resposta interceptada; disponibilidade externa depende do ViaCEP. Referência: https://viacep.com.br/
- Dados pessoais e endereços: guardados em sessionStorage; não sincronizam conta, dispositivos ou Firestore. Integração persistente depende de endpoints de paciente/endereço e identificação segura acordados com Jefferson.
- Convênios/carteirinhas do sitemap: ainda não implementados. Exigem definir campos, vínculo com paciente, armazenamento e contrato de API; não criar uma carteira aparentemente válida sem isso.
- Login do fluxograma: fora do MVP conforme checklist; exige autenticação/autorização no backend.
- Preferências de notificações: somente interface local; envio exige serviço de backend, contatos e consentimento.
- Suporte: FAQ funciona; canal externo ainda precisa ser informado pela equipe.
- Pagamento: não implementado; não confundir o resumo de valor com cobrança.
- Fotos: iniciais continuam como alternativa; não foram inventadas fotos dos profissionais.

## Resultado dos testes desta revisão

- Build TypeScript/Vite: aprovado.
- Suíte principal: 18 testes aprovados.
- Contrato HTTP com respostas interceptadas: 1 teste aprovado.
- Axe WCAG A/AA: zero violações nas sete telas avaliadas em duas larguras.
- Edge: zero impedimentos de instalação; instalação aceita, abertura automatizada expirou.
- API real: porta 8000 indisponível.

## Como verificar

Dentro de frontend: `npm install`, `npm run build`, `npm run test:e2e` e `npm run test:api`.

Para visualizar em desenvolvimento: `npm run dev`. Para verificar a PWA: compilar e executar `npm run preview`, usando o endereço informado pelo terminal. O Service Worker é registrado na versão compilada.

Para integração real: configurar `VITE_DATA_MODE=api`, `VITE_API_URL=http://127.0.0.1:8000` e um `VITE_PATIENT_ID` válido, reiniciar Vite e disponibilizar FastAPI com CORS, catálogo, paciente e horários de teste. Essa é a etapa conjunta frontend/backend que falta. Não incluir credenciais Firebase no frontend.

## Arquivos da revisão

Busca e mapa: src/pages/DiscoveryPages.tsx. Marca: src/layouts/AppShell.tsx, index.html e public/manifest.webmanifest. Layout/contraste: src/index.css. CEP: src/services/postal.ts e src/pages/ProfilePage.tsx. Confirmação: src/pages/BookingPages.tsx. Validação: tests/accessibility.spec.ts, tests/review.spec.ts, tests/api.spec.ts, playwright.api.config.ts e playwright.config.ts. Dependências: package.json/package-lock.json. Este checklist: CHECKLIST.md.
