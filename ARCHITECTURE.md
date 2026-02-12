# ARCHITECTURE.md

## Visão Geral

O projeto usa **Next.js App Router** com divisão por grupos de rota:

- `app/(auth)` para autenticação.
- `app/(app)` para área autenticada.

O layout autenticado centraliza sidebar, header, theming e contexto de navegação.

## Stack

- Next.js 16 + React 19 + TypeScript
- NextAuth (credentials + JWT)
- Prisma + PostgreSQL
- Tailwind CSS v4 + shadcn/ui
- Zod + React Hook Form
- Vitest + Playwright

## Estrutura Principal

```text
app/
  (auth)/
    login/page.tsx
  (app)/
    layout.tsx
    dashboard/
    factories/
      _components/
      _lib/
    users/
      _components/
      _lib/
    admin/
      dictionaries/
      menus/
    crud/[schema]/[table]/
  api/auth/[...nextauth]/route.ts
components/
  app-sidebar.tsx
  nav-*.tsx
  site-header.tsx
  ui/*
lib/
  auth.ts
  prisma.ts
  rbac.ts
  dictionary/*
  menu/*
  generated/prisma/*
prisma/
  schema.prisma
  seed.ts
tests/
  unit/
  integration/
  e2e/
```

## Layout e Navegação

- `app/(app)/layout.tsx`
  - Recupera sessão (`getServerSession(authOptions)`).
  - Injeta usuário no sidebar.
  - Renderiza `SiteHeader` + conteúdo da rota.
- `components/app-sidebar.tsx`
  - Menus e navegação.
  - Menu de usuário com logout e troca de tema.
- `components/site-header.tsx`
  - Breadcrumb dinâmico derivado da URL.

## Autenticação e Segurança

### Login

- Provider `Credentials` em `lib/auth.ts`.
- Senha validada com `bcrypt.compare`.
- Usuário inativo (`active = false`) é bloqueado no login.

### Sessão

- Estratégia JWT.
- Campos adicionados:
  - `token.id`
  - `token.roles`
  - `session.user.id`
  - `session.user.roles`

### Proteção de Rotas

- Middleware em `proxy.ts` protege área autenticada (`/dashboard`, `/factories`, `/users`, `/admin`, `/crud`).

### RBAC

- `lib/rbac.ts` implementa `hasRole`.
- Módulos usam guards específicos:
  - `requireFactoriesSession`, `requireFactoriesManager`
  - `requireUsersSession`, `requireUsersManager`

## Padrão de Módulo (Factories / Users / Admin)

Cada domínio segue padrão consistente:

- Domínios com `_lib`:
  - `_lib/schema.ts`: validação e parsing de query/form.
  - `_lib/repository.ts`: acesso Prisma.
  - `_lib/service.ts`: regras de negócio + mapeamento de erros Prisma.
  - `_lib/actions.ts`: server actions, autorização, `revalidatePath`.
- Domínios em `admin/*`:
  - `schema/*.ts`: validação de query/form com Zod.
  - `actions/*.ts`: server actions e operações Prisma.
  - `components/*`: UI específica do domínio.

## Fluxo de Mutação

```text
Form/UI -> action.ts -> schema.ts -> service.ts -> repository.ts -> Prisma -> PostgreSQL
```

Tratamento de erro:

- `P2002` (unique) -> erro de campo amigável.
- `P2025` (not found) -> erro de domínio.
- `P2003` (FK/dependência) -> bloqueio de remoção.

## Dicionário e CRUD Dinâmico

- Metadados de tabela/coluna em `DictionaryTable` e `DictionaryColumn`.
- Execução de DDL e CRUD dinâmico em `lib/dictionary/*`.
- Rotas:
  - `/admin/dictionaries`
  - `/admin/dictionaries/[id]/columns`
  - `/crud/[schema]/[table]`
- Segurança:
  - acesso apenas a tabelas registradas em dicionário,
  - bloqueio para tabelas de sistema,
  - sanitização de identificadores SQL.

## Menus Dinâmicos

- Menus carregados do banco por `lib/menu/loader.ts`.
- Gestão administrativa em `/admin/menus`.
- Reordenação visual via drag-and-drop na lista paginada de menus (persistida por Server Action).

## Dados e Banco

Modelos principais em `prisma/schema.prisma`:

- `User`
- `Role`
- `UserRole`
- `Factory`
- `Menu`
- `MenuRole`
- `DictionaryTable`
- `DictionaryColumn`

Cliente Prisma gerado em `lib/generated/prisma`.

## Theming

- `components/theme-provider.tsx` usa `next-themes`.
- `app/layout.tsx` envolve toda a aplicação com `ThemeProvider`.
- Seletor de tema no menu de usuário (`components/nav-user.tsx`):
  - Claro
  - Escuro
  - Sistema

## Testes

- Unitários: `tests/unit`
- Integração: `tests/integration`
- E2E: `tests/e2e`
- Mock HTTP: `tests/msw`

Configurações:

- `vitest.config.ts`
- `playwright.config.ts`

## Decisões Técnicas Relevantes

1. App Router com Server Components por padrão para reduzir acoplamento com estado cliente.
2. Server Actions para mutações e invalidação de cache.
3. Separação explícita de camadas para manter domínio testável.
4. Sessão enxuta (JWT com roles) para autorização de tela/ação.
