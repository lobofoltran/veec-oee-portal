# AGENTS.md

Guia para agentes (IA ou automações) e colaboradores que atuam neste repositório.

## Objetivo

Manter e evoluir o **VEEC OEE Portal** com segurança, previsibilidade e consistência de arquitetura (App Router + módulos por domínio).

## Regras de Trabalho

1. Preserve o padrão por domínio:
   - `app/(app)/<dominio>/_lib` para regra de negócio e acesso a dados.
   - `app/(app)/<dominio>/_components` para componentes de UI do domínio.
   - `app/(app)/<dominio>/*.tsx` para páginas e composição.
2. Toda mutação deve passar por **Server Actions** em `_lib/actions.ts`.
3. Faça validação de entrada com **Zod** antes de chamar service/repository.
4. Controle de permissão deve ser explícito (`require*Session`, `require*Manager`, `canManage*`).
5. Use componentes de `components/ui/*` (shadcn) antes de criar UI customizada.
6. Não acesse banco diretamente em componentes de UI.
7. Em rotas protegidas, mantenha coerência com `proxy.ts`.

## Fluxo Arquitetural Obrigatório

Para criação/edição/exclusão:

`UI -> Server Action -> Schema (Zod) -> Service -> Repository (Prisma) -> DB`

- **Action**: valida input, aplica autorização, trata erro de negócio, chama `revalidatePath`.
- **Service**: regras de negócio e mapeamento de erros Prisma (`P2002`, `P2025`, etc).
- **Repository**: queries Prisma puras.

## Autenticação e Autorização

- Autenticação: `next-auth` credentials (`lib/auth.ts`).
- Sessão em JWT com `session.user.id` e `session.user.roles`.
- Tipagem estendida em `types/next-auth.d.ts`.
- Papéis atuais: `ADMIN`, `MANAGER`, `OPERATOR`.
- Gestão de `users` e `factories`: `ADMIN` e `MANAGER`.

## UI/UX e Navegação

- Layout autenticado central em `app/(app)/layout.tsx`.
- Sidebar em `components/app-sidebar.tsx`.
- Estado ativo de menu via `usePathname`.
- Header usa breadcrumb baseado na rota (`components/site-header.tsx`).
- Theming (light/dark/system) no menu de usuário (`components/nav-user.tsx`) com `next-themes`.

## Qualidade Mínima Antes de Entregar

Execute:

```bash
pnpm lint
pnpm test
pnpm build
```

Se alterar fluxo crítico, rode também:

```bash
pnpm test:e2e
```

## Convenções Importantes

- TypeScript estrito.
- Evite `any`.
- Mensagens de erro orientadas ao usuário nas actions.
- Revalidação explícita de páginas afetadas após mutações.
- Não exponha segredos em logs, commits ou documentação.

## Ambiente

Variáveis obrigatórias:

- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`

## Mudanças Estruturais

Ao adicionar novo domínio (`machines`, por exemplo):

1. Criar `app/(app)/machines` com `_lib` e `_components`.
2. Implementar auth do domínio (`_lib/auth.ts`).
3. Implementar actions + service + repository + schema.
4. Incluir rota no sidebar se aplicável.
5. Adicionar cobertura de testes de unidade/integrados/e2e.
