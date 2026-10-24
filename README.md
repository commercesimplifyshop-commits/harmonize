# Harmonize Eventos

Plataforma da **Harmonize Eventos**, de Cris Rebouças: *assessoria e decoração, com o requinte que você merece.*

Esta é a **v1 (demonstração)**: o site público completo, responsivo, com conteúdo estático. O painel administrativo com login (v2) e o registro de visitas (v3) já estão planejados na estrutura. Veja [docs/ARQUITETURA.md](docs/ARQUITETURA.md).

```
packages/shared   tipos do conteúdo editável (contrato entre site, api e painel)
apps/web          React 19 + Vite + TypeScript: site público (e o painel em /admin, na v2)
apps/api          NestJS: hoje só GET /api/health; base do painel
docs/             ARQUITETURA.md (estrutura e plano da v2), HOSPEDAGEM.md (HostGator)
```

## Rodar local

Requer Node 20 ou superior. Na raiz:

```bash
npm install
npm run dev        # site em http://localhost:5173
npm run dev:api    # api em http://localhost:3001/api/health (opcional)
```

Outros comandos da raiz: `npm run typecheck`, `npm run lint`, `npm run build`.

## Páginas

| Rota | Conteúdo |
|---|---|
| `/` | Carrossel de banners, serviços, apresentação da Cris, eventos em destaque, como funciona, depoimento |
| `/sobre` | Cris Rebouças e a Harmonize, valores |
| `/eventos` | Eventos realizados, com filtro por tipo (`?tipo=casamento`) |
| `/eventos/:slug` | Evento com data, local, descrição e galeria com ampliação |
| `/orcamento` | Formulário que abre o WhatsApp com a mensagem pronta (`?tipo=` já seleciona o tipo de evento) |
| `/contato` | Formulário por e-mail (na v1 só simula o envio) e outros canais |

WhatsApp, e-mail e Instagram ficam numa linha acima do cabeçalho em todas as páginas.

## Onde mexer

- **Textos, banners, eventos e contatos:** `apps/web/src/data/static/seed/`. Na v2, a Cris edita tudo isso pelo painel.
- **Cores e fontes:** variáveis no topo de `apps/web/src/styles/global.css` (verde-sálvia e bronze, tirados das artes).
- **Logo:** `apps/web/public/img/` (selo recortado da arte original, com fundo transparente).

## A confirmar

- E-mail da Harmonize (está um provisório em `seed/settings.ts`).
- Cidade e área de atendimento (deduzidas do DDD 75).
- Foto da Cris, textos da página Sobre e um depoimento real.
- Fotos e eventos reais (os atuais são ilustrativos, de bancos de imagem gratuitos; o rodapé avisa).

## Deploy

Ver [docs/HOSPEDAGEM.md](docs/HOSPEDAGEM.md). Resumo: o build de `apps/web` vai para o `public_html` da HostGator (com o `.htaccess` incluído). A api da v2 precisa de um plano com Node.js.
