# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Platform for Harmonize Eventos (event planner Cris Rebouças). v1 is the public site with static demo content; v2 adds an admin panel with login (edit pages, banners, events, photo uploads); v3 adds client visit logging from a phone. Hosting target is HostGator with MySQL. `README.md`, `docs/ARQUITETURA.md` and `docs/HOSPEDAGEM.md` hold the plan; read ARQUITETURA before starting v2 work.

User-facing text, routes, query params and docs are pt-BR; code identifiers and comments are English.

## Commands

npm workspaces; run from the repo root.

```bash
npm install
npm run dev          # web, http://localhost:5173 (proxies /api and /uploads to :3001)
npm run dev:api      # api, http://localhost:3001/api/health
npm run typecheck    # web
npm run lint         # oxlint (web) + eslint (api)
npm run build        # web then api
```

No tests yet. CI (`.github/workflows/ci.yml`) runs typecheck, lint and build.

## Architecture

- **`packages/shared`** is types only (`import type`), consumed as TS source, no build. It defines everything the admin can edit (`SiteSettings`, `Banner`, `PagesContent`, `EventItem`, ...). Changing content shape starts here. The api does not import it yet (see ARQUITETURA for how to wire it).
- **Data access:** pages never hardcode copy. They read through the `DataSource` interface (`apps/web/src/data/source.ts`) via `useData`/`usePage`/`useSettings` (`data/hooks.ts`). `data/index.ts` picks `staticSource` (seed files in `data/static/seed/`) or `httpSource` (api, v2) by `VITE_DATA_SOURCE`. New content must go through this layer so the v2 switch needs no component changes; `httpSource` documents the endpoint contract the api must implement.
- **Settings** load once in `SettingsProvider` before anything renders.
- **Photos:** always render through `components/Photo.tsx`, never a raw `<img>` for content. The frame sets the size (`ratio` or CSS), `Media.focus` sets object-position, and `media: null` renders the branded placeholder. Text over photos always sits on a solid dark-green shade. Layouts must hold with any uploaded photo or none.
- **Styling:** plain CSS. Tokens (sage green and bronze palette, Cormorant Garamond + Montserrat) live in `styles/global.css`, which `main.tsx` imports before `App` so component CSS can override `.wrap` and other globals; keep that order. Component and page CSS sit next to their files.
- **WhatsApp:** `lib/whatsapp.ts` builds `wa.me` links; the quote form turns `QuoteRequest` into the message.
- **api:** NestJS with global prefix `/api`, only `health` now. Planned modules, MySQL schema and the login security requirements (argon2id, HttpOnly cookie JWT + rotating refresh, throttling and lockout, reCAPTCHA, helmet) are in ARQUITETURA. Follow them when building auth.
- **Deploy:** `apps/web/public/.htaccess` handles SPA fallback, HTTPS and headers on Apache, and leaves `/api` and `/uploads` to the api.
