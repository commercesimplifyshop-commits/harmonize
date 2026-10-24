# Arquitetura

A Harmonize é uma plataforma para a Cris Rebouças gerenciar o negócio de eventos: site público, painel administrativo e, depois, registro de visitas a clientes. Ela é construída em fases. Esta versão (v1) entrega o site público com conteúdo de demonstração, já organizado para receber o painel sem refazer as páginas.

```
packages/shared   Tipos de todo conteúdo editável (o "contrato" entre site e api)
apps/web          React + Vite: site público (v1) e, depois, o painel em /admin (v2)
apps/api          NestJS: hoje só /api/health; na v2, conteúdo, eventos, fotos e login
```

## Como o site lê o conteúdo

Nenhuma página tem texto fixo no código. Todas pedem o conteúdo à interface `DataSource` (`apps/web/src/data/source.ts`):

| Método | O que devolve | Endpoint na v2 |
|---|---|---|
| `getSettings()` | Nome, WhatsApp, e-mail, Instagram, cidade | `GET /api/settings` |
| `getBanners()` | Slides ativos da home, em ordem | `GET /api/banners` |
| `getPage(slug)` | Textos e imagens de `home`, `sobre`, `eventos`, `orcamento`, `contato` | `GET /api/pages/:slug` |
| `listEvents()` | Eventos publicados, do mais recente ao mais antigo | `GET /api/events` |
| `getEvent(slug)` | Um evento com galeria | `GET /api/events/:slug` |
| `sendContact(msg)` | Envia o formulário de contato | `POST /api/contact` |

Existem duas implementações:

- **`static/`** (v1, em uso): devolve o conteúdo dos arquivos em `data/static/seed/`. O formulário de contato só simula o envio.
- **`http/`** (v2): chama a api. Para trocar, basta `VITE_DATA_SOURCE=api` no build. Nenhum componente muda.

Os arquivos de `seed/` também servem de carga inicial do banco na v2.

### Por que os tipos ficam em `packages/shared`

`PagesContent`, `Banner`, `EventItem` etc. descrevem **exatamente o que a Cris pode editar**. O site renderiza a partir deles, a api vai salvar e devolver o mesmo formato, e o painel vai montar os formulários de edição a partir deles. Mudar um campo em um lugar só obriga os três lados a acompanhar (o TypeScript acusa).

O pacote só tem tipos (`import type`), então não precisa de build. Na v2, quando a api passar a importar o pacote, configure o `tsconfig` da api com `paths` apontando para `packages/shared/src`, ou gere `.d.ts` com `tsc --emitDeclarationOnly`.

## Regra de layout: a página não depende da foto

Toda imagem passa pelo componente `Photo` (`apps/web/src/components/Photo.tsx`). O tamanho é definido pelo quadro, nunca pela imagem: a foto preenche com `object-fit: cover` e o ponto de foco (`Media.focus`) pode ser ajustado pelo painel. Sem foto, o quadro mostra um bloco verde com o anel bronze do selo e um rótulo. Texto sobre foto (banners, topo do evento) sempre tem uma camada verde-escura sólida por baixo. Assim, qualquer foto que a Cris enviar pelo celular mantém a página alinhada e legível.

## v2: painel administrativo

### Rotas no web

`/admin/*` entra no `App.tsx` como rotas com `lazy()` e layout próprio, para o visitante do site não baixar o código do painel.

| Rota | Função |
|---|---|
| `/admin/login` | Login |
| `/admin` | Resumo: próximos eventos, mensagens novas |
| `/admin/paginas` e `/admin/paginas/:slug` | Lista das páginas estáticas e editor da página escolhida, com pré-visualização |
| `/admin/banners` | Escolher imagens, textos e ordem dos slides da home |
| `/admin/eventos` e `/admin/eventos/:id` | Criar e editar eventos: título, data, descrição e upload de fotos |
| `/admin/mensagens` | Mensagens do formulário de contato e pedidos de orçamento |
| `/admin/configuracoes` | WhatsApp, e-mail, Instagram, troca de senha |
| `/admin/visitas` (v3) | Registro de visitas a clientes pelo celular (tipo `Visit`): rascunho salvo enquanto digita, fotos tiradas na hora |

O painel precisa funcionar bem no celular, porque a Cris usa o site nas visitas. Para isso: upload com `<input type="file" accept="image/*" capture="environment">` (abre a câmera), compressão da foto no navegador antes de enviar, e um PWA (`manifest.webmanifest` já está publicado) com rascunho offline nas visitas.

### Módulos da api (NestJS)

| Módulo | Responsabilidade |
|---|---|
| `database` | Conexão MySQL (HostGator). Sugestão: Prisma, que tem migrations e tipos |
| `auth` | Login, refresh, logout, troca de senha |
| `settings`, `pages`, `banners` | Leitura pública + escrita protegida |
| `events` | CRUD de eventos, slug único, publicar e despublicar |
| `media` | Upload: valida o tipo pelo conteúdo do arquivo (não pela extensão), redimensiona com `sharp` (ex.: 1920 px e 600 px, WebP), remove EXIF/GPS, salva em `UPLOAD_DIR` e serve em `/uploads` |
| `contact` | Recebe o formulário, descarta se o honeypot `website` vier preenchido, valida o reCAPTCHA, envia por SMTP e guarda no banco |
| `visits` (v3) | Visitas a clientes |

### Banco (MySQL)

| Tabela | Campos principais |
|---|---|
| `users` | id, email (único), password_hash, name, role, failed_attempts, locked_until, created_at |
| `refresh_tokens` | id, user_id, token_hash, expires_at, revoked_at, user_agent, ip |
| `settings` | uma linha com os campos de `SiteSettings` |
| `pages` | slug (PK), content (JSON no formato de `PagesContent[slug]`), updated_at, updated_by |
| `banners` | id, image_url, image_alt, image_focus, eyebrow, title, subtitle, cta_label, cta_href, active, sort_order |
| `events` | id, slug (único), title, category, date, location, guests, summary, description, cover_media_id, published, featured, timestamps |
| `media` | id, url, alt, focus, width, height, size, mime, created_at |
| `event_media` | event_id, media_id, sort_order |
| `messages` | id, type (contato ou orçamento), payload (JSON), read_at, created_at |
| `visits` (v3) | campos do tipo `Visit` + `visit_media` |

Guardar cada página como JSON validado pelo tipo do `shared` permite adicionar um campo novo numa página sem migration.

### Segurança do login

- Senha com **argon2id** (`argon2`). Nunca guardar nem registrar a senha em log.
- **Access token** JWT curto (15 min) e **refresh token** opaco (30 dias), os dois em cookies `HttpOnly`, `Secure`, `SameSite=Strict`, com `Path=/api`. Nada de token em `localStorage`.
- Refresh com **rotação**: cada uso gera um novo e revoga o anterior. Reuso de um token revogado derruba todas as sessões do usuário.
- **Rate limit** no login com `@nestjs/throttler` (ex.: 5 tentativas por minuto por IP) e **bloqueio temporário** da conta após 10 falhas (`failed_attempts`, `locked_until`).
- Mensagem de erro genérica ("e-mail ou senha incorretos"), sem dizer qual dos dois.
- **reCAPTCHA v3** no login e no contato: o campo `captchaToken` já está previsto em `ContactMessage`; a api valida com `RECAPTCHA_SECRET`.
- `helmet` para cabeçalhos de segurança, `ValidationPipe` com `whitelist` e `forbidNonWhitelisted` em todos os DTOs, e CORS restrito (o site chama a api no mesmo domínio).
- Sem cadastro público: o usuário da Cris é criado por um script de seed com senha forte.
- Opcional depois: segundo fator (TOTP) para a conta admin.

## Ordem sugerida da v2

1. Banco + Prisma + seed a partir de `apps/web/src/data/static/seed`.
2. Endpoints públicos de leitura; ligar `VITE_DATA_SOURCE=api` e conferir que o site fica igual.
3. Auth completo, com testes.
4. Painel: eventos e upload de fotos (o que a Cris mais vai usar), depois banners, páginas e configurações.
5. Formulário de contato enviando e-mail de verdade.
