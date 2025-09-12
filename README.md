# sortea2 — Next.js + Tailwind (Facebook/Instagram)

Starter para un clon básico tipo AppSorteos enfocado en Facebook/Instagram.

## Requisitos
- Node.js 18+
- Una app de Meta (Facebook) para usar Graph API (Instagram/Facebook).

## Instalación
```bash
pnpm install   # o npm install / yarn
cp .env.example .env.local
pnpm dev       # o npm run dev / yarn dev
```

## Scripts
- `pnpm dev` — modo desarrollo
- `pnpm build` — compila
- `pnpm start` — producción

## Estructura
- `app/` — App Router de Next.js
- `components/` — UI y bloques reutilizables
- `app/api/meta/*` — endpoints placeholder para OAuth, webhooks y fetch de comentarios

## Notas
- Este proyecto no usa Vite (Next.js usa SWC por defecto). Si quieres una versión Vite + React, dímelo y genero otra plantilla.
- Para producción, necesitarás exponer `PUBLIC_URL` accesible por Meta para validar webhooks.
