# Hospedagem na HostGator

## Site (v1): só arquivos estáticos

Funciona em qualquer plano, inclusive compartilhado.

1. `npm install` e `npm run build -w apps/web` na raiz do repositório.
2. Envie **o conteúdo** de `apps/web/dist/` para `public_html/` (Gerenciador de Arquivos do cPanel ou FTP). Inclua o `.htaccess`: ele é um arquivo oculto, ative "mostrar arquivos ocultos".
3. No cPanel, ative o SSL gratuito (AutoSSL / Let's Encrypt) do domínio. O `.htaccess` já redireciona HTTP para HTTPS.

O `.htaccess` faz as rotas do React funcionarem (`/sobre`, `/eventos/...` abrem direto ou depois de recarregar a página), define cabeçalhos de segurança e cache longo para os arquivos com hash.

## API (v2): precisa de Node.js

A api NestJS é um processo Node.js. Na HostGator isso depende do plano:

- **VPS ou dedicado:** funciona. Rode a api com `pm2` (ou como serviço do sistema) e faça o Apache/Nginx encaminhar `/api` e `/uploads` para `localhost:3001`.
- **Compartilhado com "Setup Node.js App" no cPanel:** alguns planos têm essa opção (Phusion Passenger). Crie a aplicação apontando para `apps/api` e o arquivo de entrada `dist/main.js`, com a URL `/api`. Confirme a versão de Node disponível (o projeto pede 20 ou superior).
- **Compartilhado sem Node.js:** o site estático continua funcionando, mas a api precisa de outro lugar (um VPS pequeno, ou hospedagem Node à parte) com `/api` apontando para lá.

**Antes de contratar ou mudar de plano, confirme com a HostGator se o plano tem Node.js.** Essa é a única dependência da v2 que não roda em qualquer hospedagem.

### Banco de dados

Crie um banco MySQL e um usuário no cPanel ("Bancos de dados MySQL"), dê todas as permissões ao usuário nesse banco e monte o `DATABASE_URL` do `apps/api/.env` (modelo em `.env.example`). Se a api rodar fora da HostGator, libere o IP dela em "MySQL remoto".

### Fotos enviadas pelo painel

Ficam em `UPLOAD_DIR`, **fora** de `public_html`, e são servidas pela api em `/uploads`. Assim um novo deploy do site não apaga as fotos. Inclua essa pasta no backup.
