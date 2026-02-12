# VEEC OEE Portal

## Stack
- Next.js 16 (App Router)
- TypeScript
- Prisma + PostgreSQL (infra tables)
- Kysely/SQL raw (dynamic DDL + CRUD)
- NextAuth credentials
- shadcn/ui + Radix
- React Hook Form + Zod
- TanStack Table
- Vitest + RTL + Playwright

## Environment
Create `.env` from `.env.example`:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/veec_oee_portal
NEXTAUTH_SECRET=change-this-secret
NEXTAUTH_URL=http://localhost:3000
AUTH_TRUST_HOST=true
```

## Local setup
```bash
pnpm i
docker compose up -d
pnpm db:migrate
pnpm db:generate
pnpm tsx prisma/seed.ts
pnpm dev
```

## Main Modules
- `factories` and `users` CRUD modules
- `admin/dictionaries` metadata builder
- `admin/menus` sidebar/menu management with drag-and-drop reorder
- Dynamic CRUD routes generated from dictionary metadata: `/crud/[schema]/[table]`

## Data Dictionary
Admin can register dictionary tables and columns in:
- `/admin/dictionaries`
- `/admin/dictionaries/[id]/columns`

Flow:
`UI -> Server Action -> Zod -> Prisma metadata -> DDL engine -> PostgreSQL`

## Dynamic CRUD
Generated runtime CRUD routes:
- `/crud/[schema]/[table]`
- `/crud/[schema]/[table]/new`
- `/crud/[schema]/[table]/[id]`

Safety constraints:
- Only dictionary-registered tables are accessible
- `isSystem` tables are blocked
- SQL identifiers validated (`[a-zA-Z_][a-zA-Z0-9_]*`)
- Identifiers are quoted and never interpolated unchecked

## Menu Builder
- Menus stored in `Menu` and `MenuRole`
- Sidebar is DB-driven (`components/app-sidebar.tsx` + `lib/menu/loader.ts`)
- Admin UI:
  - `/admin/menus`
- Menu ordering:
  - drag-and-drop in table view
  - persisted via server action
  - works in ordering mode (`sortBy=order`, `sortDir=asc`)
- Bootstrap seed creates default entries including Admin -> Dictionary and Admin -> Menus

## Scripts
```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm test:integration
pnpm test:e2e
pnpm test:all
pnpm db:migrate
pnpm db:generate
pnpm db:push
pnpm playwright:install
pnpm playwright:test
```

## Tests
- Unit: identifier validation, DDL mapping, Zod builder, menu tree
- Integration: dictionary DDL + CRUD + FK validation
- Integration: menu reorder action
- E2E: users CRUD and dictionary/menu flow
