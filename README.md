# NDIS App

Web app for managing NDIS participants, providers and invoices, including support-item pricing from the official NDIS catalogue.

## Stack

Next.js 16 (App Router), React 19, TypeScript, Ant Design, Tailwind CSS v4, Kysely + `pg`, PostgreSQL 18.

## Getting started

Requires Node.js 20+ and Docker.

```bash
npm install
cp .env.example .env             # fill in values
docker compose up -d
npm run dev
```

`.env` needs the Postgres credentials (`POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`) and a `DATABASE_URL` that matches them. Docker Compose and Next.js both read it.

Postgres runs on `localhost:5433`. On first start it runs the scripts in `src/database/init/` (schema and reference data). To re-run them, reset the volume with `docker compose down -v`.

## Architecture

- `src/app` — pages and REST route handlers (`/api/*`); responses use a `{ data }` / `{ error: { code, message, details? } }` envelope.
- `src/repositories` — all database access (Kysely); route handlers never query directly.
- `src/lib` — request validation and shared utilities.
- `src/components` — generic list/form components reused across entities.
- `src/database` — Kysely setup and SQL init scripts.

Deletes are soft (`deleted_at`). Monetary and date values are handled as strings or decimals end to end to avoid timezone and floating-point drift.

## Status

Participants and providers are complete. Invoices have list and delete; create/edit, rate sets, Excel import, authentication/RBAC, audit logging and AI invoice extraction are not yet implemented.

## Limitations

- No authentication or authorisation; all endpoints are open.
- Invoice creation, line items and rate matching are not implemented.
- Schema is applied through Postgres init scripts rather than a migration runner.

## Roadmap

1. Rate sets and NDIS catalogue Excel import
2. Invoice create/edit with line items and rate matching
3. Authentication, RBAC and audit logging
4. AI-assisted PDF invoice extraction
