# NUMU

A modern monorepo built with Turborepo, pnpm workspaces, Next.js, TypeScript, Tailwind CSS, and Prisma + PostgreSQL.

## Documentation

- [Phase 1: System Foundation & Architecture Specification](docs/phase-1-implementation.md)
- [Phase 2: Authentication & User Management Specification](docs/phase-2-implementation.md)

## Project Structure

```
numu/
├── apps/
│   ├── web/                  # Next.js frontend application
│   └── api/                  # NestJS backend API application
├── packages/
│   ├── database/             # Prisma ORM, database client & schema
│   ├── types/                # Shared TypeScript types
│   ├── config-eslint/        # Shared ESLint configurations
│   └── config-typescript/    # Shared TypeScript configurations
├── turbo.json                # Turborepo pipeline config
├── pnpm-workspace.yaml       # pnpm workspace definition
├── tsconfig.base.json        # Root TypeScript base config
└── package.json              # Root package (workspace root)
```

## Tech Stack

| Layer        | Technology             |
| ------------ | ---------------------- |
| Monorepo     | Turborepo 2.x          |
| Package Mgr  | pnpm 10.x              |
| Language     | TypeScript 5.x         |
| Frontend     | Next.js 15 + React 19  |
| Backend API  | NestJS 11              |
| Styling      | Tailwind CSS v4        |
| Database ORM | Prisma 6.x             |
| Database     | PostgreSQL 16          |
| Linting      | ESLint 9 (flat config) |
| Formatting   | Prettier 3.x           |

## Getting Started

### Prerequisites

- Node.js >= 20
- pnpm >= 10
- PostgreSQL 16 running locally (or a remote connection string)

### Installation

```bash
pnpm install
```

### Environment Setup

Copy the example env files and fill in your values:

```bash
cp apps/web/.env.example apps/web/.env.local
cp packages/database/.env.example packages/database/.env
```

### Database

```bash
# Generate the Prisma client
pnpm db:generate

# Push schema to the database (development)
pnpm db:push

# Run migrations (production)
pnpm db:migrate

# Open Prisma Studio
pnpm db:studio
```

### Development

```bash
pnpm dev
```

### Build

```bash
pnpm build
```

### Lint & Format

```bash
pnpm lint
pnpm format
```

### Type Check

```bash
pnpm typecheck
```
