# Como preparar a publicação do frontend

Publicar a interface é uma tarefa de frontend/hospedagem. Não é necessário criar outro backend. Nenhum site público foi criado nesta entrega.

## O que está pronto

O comando `npm run build`, executado na pasta frontend, gera a pasta `dist`. Ela contém o site compilado, o manifesto, os ícones e o Service Worker.

## O que configurar na hospedagem escolhida

1. Usar a pasta frontend como raiz do projeto e uma versão do Node compatível com package.json.
2. Instalar as dependências com `npm ci` e executar `npm run build`.
3. Publicar o conteúdo de dist na raiz do domínio, com HTTPS.
4. Configurar o servidor para retornar index.html nas rotas da aplicação, como /busca, /agenda e /profissional/ana, quando não houver arquivo correspondente. Arquivos estáticos existentes devem continuar sendo servidos normalmente.
5. Evitar cache prolongado de index.html e sw.js. Os arquivos de assets têm nomes com versão e podem usar cache longo.

## Configuração para dados reais

Antes do build, definir:

- VITE_DATA_MODE=api
- VITE_API_URL com o endereço HTTPS público do FastAPI
- VITE_PATIENT_ID com o identificador de teste combinado com a equipe, enquanto não existe autenticação
- VITE_SUPPORT_URL com o contato oficial HTTPS ou mailto, se informado

Variáveis VITE ficam visíveis no navegador. Não colocar senhas, credenciais Firebase ou chaves administrativas nelas. Alterações nessas variáveis exigem novo build.

O responsável pelo backend precisa disponibilizar a API por HTTPS e liberar o domínio do frontend no CORS. O endereço 127.0.0.1 aponta para a máquina de quem está usando o site; não serve como endereço público da API.

## Conferência depois de publicar

Abrir /busca e /agenda diretamente, recarregar essas páginas, verificar as chamadas da API e testar instalação e abertura offline. O teste local de PWA já passou; esta conferência garante que a hospedagem manteve as configurações necessárias.

Sem autenticação e autorização, não tratar a publicação como pronta para operar com dados pessoais de usuários reais. Um ambiente de apresentação deve usar dados de teste e ser identificado como tal pela equipe.

## O que ainda precisa ser definido

Hospedagem, domínio ou subdomínio, acesso ao serviço e qual ambiente será publicado. Isso é uma decisão da equipe e da hospedagem; não é uma função faltando no backend.
