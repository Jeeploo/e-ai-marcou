# Busca por referência — MVP

A branch mantém a arquitetura React → FastAPI → service → repository. Nenhum seed remoto é executado pela aplicação.

## Dados

`backend/app/demo_catalog.py` é a fonte compartilhada para memória e seed Firestore: 6 clínicas fictícias em Recife, 18 profissionais, Cardiologia, Dermatologia, Ortopedia, Clínica Geral e Ginecologia. Endereços e coordenadas são ilustrativos para teste, não um diretório real de estabelecimentos. Preços variam de R$ 120 a R$ 402. Os horários cobrem 15 dias relativos à execução. Reiniciar o backend demo restaura as reservas iniciais.

Clínicas acrescentam bairro, CEP, complemento e coordenadas opcionais; ambas as coordenadas devem existir juntas. Registros antigos recebem campos vazios/nulos. Profissionais preservam fotoUrl. Agendamentos acrescentam paraQuem (mim/outra_pessoa), com padrão mim para documentos antigos; remarcações preservam o valor.

## API

GET /api/profissionais/busca aceita latitude, longitude, ordem (recomendados/distancia/preco), especialidadeId, q e valorMaximo. Coordenadas incompletas ou inválidas retornam 422. Retorna uma lista com os campos do profissional, especialidade textual, clínica completa, distanciaKm e proximoHorario (objeto ou null).

O serviço lê cada coleção uma vez por busca, evitando N+1. O próximo horário é o menor horário disponível futuro, no fuso America/Recife. A reserva continua sendo confirmada transacionalmente.

Haversine fornece quilômetros em linha reta. Após filtros, min–max normaliza distância entre resultados calculáveis e preço entre todos os resultados. Amplitude zero vale zero. Score = 0,6 distância + 0,4 preço, crescente. Empates usam distância, preço e ID; sem coordenadas da clínica, resultado fica por último nos modos de proximidade. Sem referência, ordena por preço e ID. Valores extremos podem influenciar a normalização.

## Referências e privacidade

Minha casa e Casa de Mainha são referências explicitamente fictícias. Endereços do Perfil com coordenadas válidas também aparecem. O formulário aceita nome e coordenadas manuais; não há geocoding. Alterar campos textuais do endereço limpa coordenadas. ViaCEP só preenche texto.

A referência salva persiste em sessionStorage durante a sessão; coordenadas do dispositivo ficam em memória. GPS é solicitado somente pelo botão. Falha preserva a referência anterior. Coordenadas são enviadas ao backend na consulta HTTP, nunca na URL de navegação do aplicativo; configurar logs do servidor para não reter coordenadas se necessário em uma implantação real.

Para quem é a consulta independe da referência. Não há cadastro ou identificação de dependentes. O pacienteId existente continua identificando o fluxo atual.

## Retratos

Nenhuma imagem de pessoa real foi baixada. A lista exata de 18 assets WebP está em `frontend/public/images/doctors/README.md`. Enquanto ausentes, o avatar usa iniciais; a falha da imagem não impede reservar.

## Operação

Modo local: DATA_MODE=demo. Seed remoto somente por execução explícita de `python -m scripts.seed_demo` a partir de backend, após configurar Firebase. O seed preserva horários existentes e usa o mesmo algoritmo de ID do repository. Seeds de versões anteriores usavam outros IDs: revisar esses dados antes de executar para evitar duplicações. Não é uma migração destrutiva de registros antigos.

Limitações: distância não representa percurso; disponibilidade pode mudar; consultas leem coleções inteiras e precisam paginação/índices para escala; locais pessoais não sincronizam entre dispositivos; retratos ainda precisam ser produzidos.

## Arquivos desta implementação

- `backend/app/api/routes/profissionais.py`
- `backend/app/repositories/agendamentos.py`
- `backend/app/repositories/clinicas.py`
- `backend/app/repositories/contracts.py`
- `backend/app/repositories/memory.py`
- `backend/app/schemas/agendamentos.py`
- `backend/app/schemas/clinicas.py`
- `backend/app/services/profissionais.py`
- `backend/scripts/seed_demo.py`
- `backend/tests/test_app.py`
- `backend/tests/test_clinicas_profissionais.py`
- `backend/tests/test_demo.py`
- `backend/tests/test_horarios_agendamentos.py`
- `frontend/playwright.config.ts`
- `frontend/playwright.demo.config.ts`
- `frontend/src/App.tsx`
- `frontend/src/components/DoctorCard.tsx`
- `frontend/src/data/catalog.ts`
- `frontend/src/hooks/CatalogContext.tsx`
- `frontend/src/index.css`
- `frontend/src/pages/AgendaPage.tsx`
- `frontend/src/pages/BookingPages.tsx`
- `frontend/src/pages/DiscoveryPages.tsx`
- `frontend/src/pages/HomePage.tsx`
- `frontend/src/pages/ProfilePage.tsx`
- `frontend/src/services/api.ts`
- `frontend/src/types/models.ts`
- `frontend/tests/accessibility.spec.ts`
- `frontend/tests/api.spec.ts`
- `frontend/tests/demo.spec.ts`
- `frontend/tests/flows.spec.ts`
- `frontend/tests/review.spec.ts`
- `backend/app/demo_catalog.py`
- `backend/app/schemas/busca.py`
- `backend/app/services/busca.py`
- `backend/tests/test_busca.py`
- `docs/location-ranking.md`
- `frontend/public/images/doctors/README.md`
- `frontend/src/components/SearchReference.tsx`
- `frontend/src/hooks/SearchContext.tsx`
- `frontend/src/hooks/useProfessionalSearch.ts`
- `frontend/tests/location-ranking.spec.ts`

## Validação concluída

- Backend: `backend/.venv/bin/python -m pytest backend/tests -q` — 245 testes passaram (um aviso de depreciação Starlette/httpx).
- Frontend: `npm run test:api` — 9 testes passaram.
- Frontend com API demo real: `npm run test:demo` — 5 testes passaram, incluindo GPS, referências, reserva para outra pessoa e 320/375/1280 px.
- Regressão geral: `npm run test:e2e` — 22 testes passaram, incluindo WCAG, PWA, offline, concorrência entre abas e layouts de 320 a 1440 px. A configuração inicia API demo e gera build com URL local explícita.
- `npm run build` e `npm run typecheck` passaram.
- `git diff --check` passou.

Pendência prevista: adicionar os 18 retratos sintéticos WebP. O seed remoto não foi executado; dados antigos precisam ser revisados antes de executar o seed em uma base já populada.
