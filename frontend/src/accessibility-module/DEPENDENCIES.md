# Dependências reais

| Biblioteca | Papel | Obrigatória? | Validada na exportação |
| --- | --- | --- | --- |
| react / react-dom | Componentes, hooks, renderização e hidratação | Sim | 19.2.4 na origem e 19.0.0 na cópia Vite |
| zustand | Store sem Provider extra | Sim | 5.0.14 |
| lucide-react | Ícones da interface | Sim | 1.31.0 na origem e 0.468.0 na cópia Vite |
| tailwindcss | Classes do painel | Sim | 4.3.2 |
| typescript | Verificação do código | Desenvolvimento | 5.x; 5.9.3 na cópia Vite |
| @types/react / @types/react-dom | Tipos React | Desenvolvimento | 19.x |
| VLibras remoto | Libras | Opcional | DEPENDÊNCIA EXTERNA, não validada ao vivo |
| API speechSynthesis | Voz do navegador/sistema | Só os recursos de voz | Lógica testada com simulador e indisponibilidade; voz audível não validada |

No projeto React/Tailwind existente:

```bash
npm install zustand
```

Se faltar Lucide:

```bash
npm install lucide-react
```

Configuração de Tailwind depende do projeto. No Vite já configurado não adicione Next/PostCSS extra. Num Vite novo, siga a documentação oficial para Tailwind 4 e plugin `@tailwindcss/vite`; no Next, `@tailwindcss/postcss` é uma opção do framework.

**Não exigidos pela exportação:** `@supabase/supabase-js`, `react-hot-toast`, Next.js, Firebase, Three.js, autenticação, migrações SQL, credenciais ou design system da loja. Na origem, Supabase e react-hot-toast eram imports diretos do widget; foram removidos na exportação. Avisos de voz agora usam região de status no próprio painel.

Para os testes opcionais fornecidos: TypeScript instalado para o teste da store; `playwright` e `axe-core` apenas para testes de navegador. Esses pacotes não devem ir para o bundle de produção. Versão do axe usado na revisão consta nos resultados técnicos.
