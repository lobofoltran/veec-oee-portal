# VEEC OEE Portal

Portal web para operação interna com autenticação, dashboard e módulos de cadastro (fábricas e usuários).

## Tecnologias

- Next.js 16 (App Router)
- React 19 + TypeScript
- NextAuth (credentials)
- Prisma + PostgreSQL
- Tailwind CSS v4 + shadcn/ui
- Vitest + Playwright

## Pré-requisitos

- Node.js 20+
- pnpm 9+
- PostgreSQL disponível

## Configuração

1. Instale dependências:

```bash
pnpm install
```

2. Configure variáveis de ambiente em `.env`:

```env
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=http://localhost:3000
```

3. Gere client Prisma e sincronize schema:

```bash
pnpm prisma generate
pnpm prisma db push
```

4. Popule dados iniciais (roles + admin):

```bash
pnpm tsx prisma/seed.ts
```

Credenciais padrão de desenvolvimento (seed):

- Email: `admin@veec.com`
- Senha: `admin123`

## Executar

```bash
pnpm dev
```

Aplicação em `http://localhost:3000`.

## Scripts

- `pnpm dev`: ambiente local
- `pnpm build`: build de produção
- `pnpm start`: iniciar build
- `pnpm lint`: lint
- `pnpm test`: testes unitários/integrados (Vitest)
- `pnpm coverage`: cobertura Vitest
- `pnpm test:e2e`: testes E2E (Playwright)

## Rotas Principais

- `/login`: autenticação
- `/dashboard`: visão executiva
- `/factories`: CRUD de fábricas
- `/users`: CRUD de usuários

Rotas protegidas por middleware (`proxy.ts`): `/dashboard`, `/factories`, `/users`.

## Autorização (RBAC)

Papéis:

- `ADMIN`
- `MANAGER`
- `OPERATOR`

Permissões:

- Gestão de fábricas e usuários: `ADMIN` e `MANAGER`.
- Demais perfis podem autenticar, mas sem acesso a ações de gestão.

## Estrutura por Domínio

Cada módulo em `app/(app)/<dominio>` segue:

- `_lib/schema.ts`: validação
- `_lib/repository.ts`: Prisma
- `_lib/service.ts`: regras de negócio
- `_lib/actions.ts`: server actions
- `_components/*`: UI

## Navegação e UX

- Sidebar com estados `hover` e `selecionado`.
- Breadcrumb dinâmico no header.
- Menu de usuário com:
  - dados da sessão autenticada
  - troca de tema (`Claro`, `Escuro`, `Sistema`)
  - logout

## Testes

- Unitários: `tests/unit`
- Integração: `tests/integration`
- E2E: `tests/e2e`

Playwright sobe `next dev` automaticamente via `playwright.config.ts`.

## Documentação Complementar

- `ARCHITECTURE.md`: visão técnica e fluxos
- `AGENTS.md`: guia de contribuição para agentes/automações
