# Inventário das funcionalidades e validação

A origem contém botão e painel juntos. A tabela abaixo distingue o recurso existente e o estado da **versão exportada**, após as correções. Presença de código não prova eficácia individual ou conformidade do destino. “CONCLUÍDO E VALIDADO” refere-se ao escopo descrito e aos testes em Edge/fixtures, não a uma certificação.

| Funcionalidade | Existe / comportamento | Funciona? / classificação | Responsável exportado | Persistente? |
| --- | --- | --- | --- | --- |
| Aumentar/diminuir texto | Sim, 100–200%; diminuir até o padrão 100, não abaixo dele | CONCLUÍDO E VALIDADO | Widget → effects + store | Sim |
| Resetar texto / tudo | Sim, botão geral e resetAll | CONCLUÍDO E VALIDADO | Widget + store | Sim, defaults salvos |
| Escala da página | Sim, ajuste separado de texto | CONCLUÍDO E VALIDADO | CSS zoom no conteúdo | Sim |
| Alto contraste | Sim, filtro contrast com nível 0–100 | CONCLUÍDO E VALIDADO como efeito; contraste do destino PENDENTE | effects + CSS | Sim |
| Inversão | Sim, invert + hue-rotate | CONCLUÍDO E VALIDADO como efeito | effects + CSS | Sim |
| Escala de cinza | Sim, monochromatic → grayscale | CONCLUÍDO E VALIDADO | effects + CSS | Sim |
| Visão normal | Sim, none remove apoio/filtro cinza | CONCLUÍDO E VALIDADO | store + effects | Sim |
| Protanopia | Sim, opção existente mantida; na exportação apoio estrutural comum | CONCLUÍDO E VALIDADO como apoio; eficácia individual PENDENTE | store + CSS | Sim |
| Deuteranopia | Sim, apoio estrutural comum; não simula nem daltoniza | CONCLUÍDO E VALIDADO como apoio | store + CSS | Sim |
| Tritanopia | Sim, apoio estrutural comum; não simula nem daltoniza | CONCLUÍDO E VALIDADO como apoio | store + CSS | Sim |
| Saturação | Sim, 0–200% | CONCLUÍDO E VALIDADO | effects | Sim |
| Brilho | Sim, 50–150% | CONCLUÍDO E VALIDADO | effects | Sim |
| Fonte legível | Sim, Arial/Helvetica/sans-serif | CONCLUÍDO E VALIDADO | CSS + store | Sim |
| Fonte alternativa para leitura | Sim, opção derivada da antiga “fonte para dislexia” | CONCLUÍDO E VALIDADO como declaração CSS; fonte realmente disponível DEPENDÊNCIA EXTERNA | CSS | Sim |
| OpenDyslexic fornecida | Não, não há arquivo nem carregador dessa fonte | PENDENTE se o grupo quiser incluir | Nenhum asset | Não aplicável |
| Espaçamento de letras | Sim, 0–10px | CONCLUÍDO E VALIDADO | CSS + effects | Sim |
| Espaçamento de palavras | Sim, 0–10px | CONCLUÍDO E VALIDADO | CSS + effects | Sim |
| Altura da linha | Sim, base 1,5 mais 0–1 | CONCLUÍDO E VALIDADO | CSS + effects | Sim |
| Alinhamento | Sim, default/left/center/right/justify | CONCLUÍDO E VALIDADO para aplicação/remoção; layout real PENDENTE | CSS + effects | Sim |
| Modo leitura | Sim, fundo/texto/fontes de apresentação | CONCLUÍDO E VALIDADO como efeito | CSS | Sim |
| Destacar links | Sim | CONCLUÍDO E VALIDADO | CSS | Sim |
| Destacar botões | Sim | CONCLUÍDO E VALIDADO | CSS | Sim |
| Destacar títulos | Sim, até h6 na exportação | CONCLUÍDO E VALIDADO | CSS | Sim |
| Foco visível/dicas teclado | Sim, destaque adicional; não cria acesso onde não existe | CONCLUÍDO E VALIDADO no painel; aplicação PENDENTE | Widget + CSS | Preferência sim |
| Destaque sob mouse | Sim, borda em elementos interativos | IMPLEMENTADO, MAS NÃO VALIDADO em todos os tipos de elemento | CSS | Sim |
| Cursor tamanho/cor | Sim, default/medium/large e default/preto/branco/amarelo | CONCLUÍDO E VALIDADO para aplicação/remoção; aparência em todos os SO PENDENTE | SVG data URL em effects | Sim |
| Posição do botão | Sim, seis posições | CONCLUÍDO E VALIDADO | Widget | Sim |
| Guia de leitura | Sim, line/mask/spotlight | CONCLUÍDO E VALIDADO para ativação/remoção; usabilidade humana PENDENTE | Widget + mouse | Sim, posição do mouse não |
| Reduzir movimento CSS | Sim, manual e preferência do SO | CONCLUÍDO E VALIDADO | CSS | Manual sim; SO externo |
| Pausar animações CSS | Sim | CONCLUÍDO E VALIDADO | CSS | Sim |
| Pausar JS/WebGL automaticamente | Não; hook de integração fornecido | IMPLEMENTADO, MAS NÃO VALIDADO no JS do destino | useAccessibilityMotion | Preferências sim |
| Ocultar imagens | Sim, apresentação preservando semântica; exceções para mídia/links interativos | CONCLUÍDO E VALIDADO para exceções críticas | CSS | Sim |
| Leitura ao clicar | Sim, somente texto fora de controles | CONCLUÍDO E VALIDADO para lógica; voz audível DEPENDÊNCIA EXTERNA | Widget + speechSynthesis | Opção sim; fala atual não |
| Ler seleção/página | Sim; página só texto visível da área de conteúdo | CONCLUÍDO E VALIDADO para lógica de página/seleção e exclusão de ocultos; voz audível DEPENDÊNCIA EXTERNA | Widget | Não, conteúdo da fala é transitório |
| Velocidade TTS | Sim, 50–500% | CONCLUÍDO E VALIDADO para lógica por simulador; vozes reais DEPENDÊNCIA EXTERNA | Widget + API nativa | Sim |
| Pausar/retomar/parar voz | Sim | CONCLUÍDO E VALIDADO para lógica por simulador; validação audível DEPENDÊNCIA EXTERNA | Widget + API nativa | Não, reprodução transitória |
| Silenciar mídias | Sim, restaura estado original e inclui novas mídias | CONCLUÍDO E VALIDADO para ativação/desativação/desmontagem | effects | Opção sim |
| Onze perfis | Sim, presets existentes; cores exclusivas; opções de fonte compatíveis | CONCLUÍDO E VALIDADO na store e alternância | store + Widget | Sim |
| Preferências locais | Original não; exportação sim | CONCLUÍDO E VALIDADO para reload/reset e storage inválido | startAccessibilityPersistence | Sim |
| Preferências na conta | Original via Supabase; exportação não carrega essa integração | DEPENDÊNCIA EXTERNA se desejado | Adaptador a implementar no destino | Não na exportação |
| VLibras | Sim, componente independente | DEPENDÊNCIA EXTERNA, não validado ao vivo | VLibrasWidget + rede | Não é preferência da store |
| Leitor de tela completo/legendas automáticas | Não fornecido pelo painel | PENDENTE na aplicação quando necessário | Sem implementação no módulo | Não aplicável |

Todas as preferências persistidas são locais ao navegador/origem. Estados transitórios (painel aberto, submenu, mouse, texto selecionado e reprodução) não são salvos. Preferências nativas do SO não são sobrescritas pelo reset.
