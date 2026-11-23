# e aí, marcou?

Projeto acadêmico do curso de Análise e Desenvolvimento de Sistemas para buscar, comparar e escolher profissionais de saúde, agendar consultas médicas e acompanhar os agendamentos.

## Integrantes

- Jefferson Paulo Gomes Ferreira
- Lucas
- Kleysson
- Alycia Maia
- Sophia Costa
- Pedro Henrique
- Tatiana Nunes

## Visão geral

O projeto surgiu como uma aplicação web progressiva (PWA) e evoluiu com a criação de um aplicativo em React Native e Expo. Os dois clientes têm interfaces e navegação independentes e consomem a mesma API REST. A busca permite comparar profissionais e preços antes de escolher um horário. Depois da confirmação, o paciente pode consultar, remarcar ou cancelar o agendamento.

## Arquitetura da solução

```text
PWA React/Vite                 React Native/Expo
      |                                |
      +--------- REST/JSON ------------+
                     |
                     v
                  FastAPI
                     |
         rotas -> serviços -> repositórios
                     |
                     v
        Cloud Firestore ou demo em memória
```

A FastAPI recebe requisições HTTP e valida os dados com schemas Pydantic. Os serviços concentram as regras de negócio. A camada de repositórios desacopla a persistência e seleciona a implementação Firestore ou em memória conforme `DATA_MODE`. O acesso ao Firestore é feito exclusivamente pelo backend.

## Tecnologias

| Camada | Tecnologias |
| --- | --- |
| PWA | React, React DOM, React Router, Vite, TypeScript, Tailwind CSS, Web App Manifest e Service Worker |
| Mobile | React Native, Expo, TypeScript, React Navigation (Native Stack e Bottom Tabs), Context API, Ionicons e React Native Safe Area Context |
| Backend | Python, FastAPI, Pydantic, Uvicorn e Pytest |
| Dados | Firebase Cloud Firestore e repositórios em memória para demonstração |

## Estrutura do repositório

```text
e-ai-marcou/
├── backend/
├── frontend/
├── mobile/
├── docs/
├── .gitignore
├── AGENTS.md
└── README.md
```

- `backend/` reúne API, regras de negócio, repositórios e testes.
- `frontend/` contém a PWA, seus recursos web e as suítes Playwright.
- `mobile/` contém o aplicativo Expo, seus recursos locais e a configuração EAS.
- `docs/` reúne documentação técnica sobre desenvolvimento, integração e acessibilidade.

## Arquitetura do mobile

A organização é inspirada em MVC. As telas apresentam os dados e recebem interações, os controladores coordenam fluxos e transformações, e os modelos definem a representação usada pelo aplicativo.

```text
mobile/src/
├── config/
├── contexts/
├── controllers/
├── hooks/
├── models/
├── navigation/
├── services/
├── theme/
├── utils/
└── views/
    ├── components/
    └── screens/
```

| Diretório | Responsabilidade |
| --- | --- |
| `config/` | URL da API e dados de referência do paciente de demonstração. |
| `contexts/` | Estado compartilhado de consultas e preferências de acessibilidade. |
| `controllers/` | Coordenação de busca, agendamento e consultas. |
| `hooks/` | Carregamento, novas tentativas, tema e adaptação do layout. |
| `models/` | Tipos de profissionais, busca, horários e agendamentos. |
| `navigation/` | Rotas tipadas, pilha raiz e abas principais. |
| `services/` | Requisições HTTP, adaptação de respostas e tratamento de erros da API. |
| `theme/` | Cores, tipografia e espaçamentos. |
| `utils/` | Funções auxiliares para dados, fotos e ícones de especialidade. |
| `views/` | Telas e componentes reutilizáveis da interface. |

### Navegação mobile

```text
RootStack
├── MainTabs
│   ├── Início
│   ├── Buscar
│   ├── Consultas
│   └── Perfil
├── Horários
├── Revisão
├── Confirmação
└── Detalhes da consulta
```

As Bottom Tabs dão acesso às áreas principais. O Native Stack organiza as etapas de agendamento e remarcação e a navegação até os detalhes de uma consulta.

### Recursos React Native utilizados na disciplina

| Recurso | Uso no aplicativo |
| --- | --- |
| Stack Navigator e Bottom Tabs | Pilha das jornadas de negócio e abas das áreas principais. |
| `Modal` | Filtros de busca e confirmação de cancelamento. |
| `FlatList` e `RefreshControl` | Listas de busca e consultas com atualização por gesto. |
| `ScrollView` | Telas com conteúdo rolável, como Perfil e Detalhes da consulta. |
| `TextInput` e `useState` | Entrada de pesquisa e controle de estados locais, como filtros e abertura de modais. |
| Ícones (Ionicons) e `Pressable` | Navegação, botões, seleção de filtros e horários. |
| `ActivityIndicator` | Feedback visual durante o carregamento. |
| `Switch` | Ativação de texto maior e alto contraste. |
| Safe Area | Tratamento das margens reservadas pelo sistema em telas e navegação. |

## Funcionalidades

| Área | Fluxo no mobile |
| --- | --- |
| Início | Saudação, exibição da próxima consulta, atalhos por especialidade e acesso à busca. |
| Busca | Pesquisa por texto, filtros de especialidade e preço, ordenação por preço ou distância e lista de profissionais. |
| Agendamento | Escolha do profissional e do horário, revisão dos dados e confirmação. |
| Consultas | Próximas consultas e histórico, detalhes, atualização por gesto, cancelamento e remarcação. |
| Perfil | Exibição do nome, dos locais salvos e do local principal do paciente de demonstração, além dos controles de acessibilidade. |

## Integração com a API

O mobile usa por padrão `https://e-ai-marcou.onrender.com`. A variável opcional `EXPO_PUBLIC_API_URL` substitui a URL base e fica disponível no bundle do aplicativo. Use-a para configurar um endereço público ou local alcançável pelo dispositivo.

| Método | Endpoint | Uso |
| --- | --- | --- |
| GET | `/api/profissionais/busca` | Buscar profissionais e obter dados para comparação. |
| GET | `/api/horarios` | Consultar horários disponíveis. |
| GET | `/api/agendamentos` | Listar os agendamentos do paciente. |
| GET | `/api/agendamentos/{id}` | Consultar os detalhes de um agendamento. |
| POST | `/api/agendamentos` | Criar um agendamento. |
| PATCH | `/api/agendamentos/{id}/reagendar` | Trocar o horário de um agendamento. |
| DELETE | `/api/agendamentos/{id}` | Cancelar a consulta, preservá-la no histórico e liberar o horário. |

A interface sinaliza carregamento, erro e ausência de resultados. Busca, horários e consultas oferecem nova tentativa quando aplicável. Se o horário deixar de estar disponível durante a operação, a API pode responder com HTTP `409 Conflict` e o aplicativo orienta a seleção de outro horário.

Busca, horários e consultas oferecem dados de demonstração locais como alternativa em fluxos com erro. Esse fallback usa dados do próprio aplicativo. O modo `DATA_MODE=demo`, por sua vez, atende requisições HTTP reais com dados em memória no backend.

### Sincronização de estado

`AppointmentsContext` compartilha a lista de agendamentos entre Início e Consultas, junto com o estado de carregamento e de erro. Após criar ou remarcar pela API, o contexto incorpora a consulta retornada e recarrega a lista. No cancelamento, atualiza a consulta com o resultado do `DELETE`. Assim, a próxima consulta e o histórico refletem a mesma fonte de dados.

```text
POST /api/agendamentos
        ↓
AppointmentsContext.refresh(agendamento)
        ↓
Início e Consultas atualizados
```

## Responsividade

`useWindowDimensions` fornece a largura e o `fontScale` do sistema. `useCompactLayout` ativa a disposição compacta em telas estreitas, com fontes ampliadas ou quando a opção Texto maior está ativa. Grades e grupos de controles podem ser reorganizados em uma coluna. As Bottom Tabs ajustam rótulos e dimensões, e a Safe Area protege o conteúdo junto a recortes de tela e barras do sistema.

Para a validação em aparelhos Android e iOS, percorra as abas, a busca e o agendamento com o tamanho padrão e com o texto do sistema ampliado. Observe a leitura dos rótulos, a reorganização dos controles e o acesso às ações perto das bordas.

## Acessibilidade

O `AccessibilityContext` compartilha as preferências de texto maior e alto contraste selecionadas no Perfil. O aplicativo considera a escala de texto do sistema (Dynamic Type no iOS) via `fontScale`, usa controles com áreas de toque ampliadas e mantém caminhos curtos entre as abas e as ações principais. Atributos como `accessibilityLabel` e `accessibilityState` comunicam a finalidade e estados como seleção, expansão e ativação aos leitores de tela.

## Fotos e identidade dos profissionais

O aplicativo resolve a foto pela ordem abaixo. Os arquivos de imagem locais ficam em `mobile/assets/doctors/`.

```text
professionalId (foto local por ID)
    ↓
fotoUrl (arquivo local correspondente ou URL HTTP/HTTPS)
    ↓
nome normalizado (correspondência com foto local)
    ↓
avatar de fallback
```

Se a imagem selecionada falhar ao carregar, a interface exibe o avatar de fallback.

## PWA e React Native

| Aspecto | PWA | Aplicativo mobile |
| --- | --- | --- |
| Renderização | React DOM e elementos HTML | React Native e componentes nativos |
| Estilos | CSS e Tailwind CSS | `StyleSheet` e tema do aplicativo |
| Ambiente | Navegador, com manifesto e Service Worker | Android e iOS com Expo |
| Navegação | React Router e rotas web | React Navigation com Native Stack e Bottom Tabs |
| Backend | FastAPI compartilhada | FastAPI compartilhada |
| API | REST/JSON | Os mesmos endpoints REST/JSON |

## Execução do backend

Use Python 3.10+ e, para executar os dois clientes, Node.js 22.13+ na série 22. Os comandos de ativação abaixo usam Bash.

```bash
git clone https://github.com/Jeeploo/e-ai-marcou.git
cd e-ai-marcou/backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```

| Serviço | URL local |
| --- | --- |
| API | <http://localhost:8000> |
| Swagger | <http://localhost:8000/docs> |
| Health | <http://localhost:8000/api/health> |

Os comandos dos clientes e de verificação partem da raiz do repositório, em terminais separados.

### `DATA_MODE=demo`

O `backend/.env.example` seleciona `DATA_MODE=demo`. O backend carrega um catálogo de demonstração com especialidades, clínicas de Recife, profissionais, horários e agendamentos do `paciente-demo`, sem exigir credenciais Firebase. Os dados ficam em memória e voltam ao estado inicial quando o processo reinicia. Execute com um único worker. Use esse modo na apresentação acadêmica e nos testes locais. Para persistência em produção, use Firebase.

### `DATA_MODE=firebase`

Configure `DATA_MODE=firebase` no ambiente do backend. Informe também `FIREBASE_CREDENTIALS` com o caminho do JSON da conta de serviço e `FIREBASE_PROJECT_ID` com o ID do projeto. Variáveis do processo têm prioridade sobre `backend/.env`. Mantenha o `.env`, as credenciais e as chaves privadas fora do Git.

## Execução da PWA

```bash
cd frontend
npm install
npm run dev
```

Abra <http://localhost:5173>. Em desenvolvimento, a PWA usa `http://localhost:8000` por padrão. Para trocar o endereço, configure `VITE_API_URL`. A publicação web está em <https://e-ai-marcou.vercel.app>.

## Execução do mobile

```bash
cd mobile
npm install
npx expo start
```

Para usar o backend local em um aparelho físico, suba o Uvicorn com `--host 0.0.0.0` e defina `EXPO_PUBLIC_API_URL` em `mobile/.env` com o IP do computador na rede, por exemplo `http://192.168.1.10:8000`. O dispositivo precisa conseguir acessar esse endereço.

### Expo Go

Em um aparelho Android ou iOS, leia o QR code exibido pelo Expo CLI com um Expo Go compatível com o SDK 58 configurado no repositório. Para apresentação ou testes quando o aparelho não consegue acessar o servidor de desenvolvimento pela rede local, use:

```bash
npx expo start --tunnel
```

Execute esse comando dentro de `mobile/`. O túnel serve o bundle do Expo. A API continua precisando de um endereço acessível pelo aparelho.

### Build Android com EAS

O arquivo `mobile/eas.json` define os perfis de build. O perfil `preview` gera um APK Android para distribuição interna. Com acesso ao projeto no Expo e uma sessão autenticada no EAS CLI, execute a partir da raiz:

```bash
cd mobile
npx eas-cli build --platform android --profile preview
```

## Testes e verificações

**Backend** — suítes Pytest da API, dos agendamentos e do modo demo.

```bash
cd backend
source .venv/bin/activate
pytest
```

**PWA** — build de produção e testes Playwright com respostas HTTP controladas.

```bash
cd frontend
npm run build
npm run test:api
```

Para testar o fluxo web com o backend real em modo demo, execute `npm run test:demo` em `frontend/`. Essa suíte inicia os dois serviços. Se o Chromium do Playwright não estiver instalado, execute `npx playwright install chromium` antes das suítes de navegador.

**Mobile** — checagem de tipos e compatibilidade das dependências com o SDK Expo.

```bash
cd mobile
npm run typecheck
npx expo install --check
```

## Desafios técnicos

| Desafio | Solução implementada |
| --- | --- |
| Escala de fontes | `useCompactLayout` adapta a disposição dos controles à largura e à escala de texto. |
| Áreas reservadas do sistema | Safe Area e ajustes na barra de abas acomodam as bordas e barras do Android e do iOS. |
| Coerência entre Início e Consultas | A próxima consulta passou a vir de `AppointmentsContext`, substituindo o dado fixo da tela inicial. |
| Identidade visual dos profissionais | A resolução de fotos combina ID, URL e nome normalizado, com avatar de fallback. |
| Integração dos dois clientes | PWA e mobile mantêm implementações independentes e usam o mesmo contrato REST do backend. |

## Deploy

| Serviço | Endereço |
| --- | --- |
| PWA na Vercel | <https://e-ai-marcou.vercel.app> |
| Backend no Render | <https://e-ai-marcou.onrender.com> |
| Repositório no GitHub | <https://github.com/Jeeploo/e-ai-marcou> |

Para hospedar o backend com persistência, configure `DATA_MODE=firebase`, as variáveis do Firestore e o domínio da PWA em `CORS_ORIGINS`. Na Vercel, configure `VITE_API_URL` com o endereço do backend público.

## Status atual

**MVP funcional.** A entrega reúne a PWA, o aplicativo React Native e a API FastAPI com repositórios em memória e Firestore. O fluxo implementado cobre busca, horários, agendamento, acompanhamento, remarcação e cancelamento. A versão inclui recursos de acessibilidade e responsividade, testes de backend e PWA, verificações do mobile, endereços de deploy e configuração para gerar o APK Android.

## Possíveis evoluções

- Autenticação e autorização para contas individuais de pacientes.
- Persistência de preferências e gerenciamento de endereços no mobile.
- Testes automatizados das jornadas mobile e ampliação das verificações em aparelhos físicos.
