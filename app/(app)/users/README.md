# Users Module

This feature provides a complete user management flow under `app/(app)/users`.

## Routes

- `/users`: list with search, active filter, pagination, and row actions.
- `/users/new`: create user with initial password.
- `/users/[id]`: details page.
- `/users/[id]/edit`: edit profile, role, and status.
- `/users/[id]/change-password`: password rotation flow.

## Architecture

- `_lib/schema.ts`: zod schemas and normalization.
- `_lib/repository.ts`: Prisma operations.
- `_lib/service.ts`: hashing and business error mapping.
- `_lib/actions.ts`: server actions + cache revalidation.
- `_components`: reusable presentation and forms.
