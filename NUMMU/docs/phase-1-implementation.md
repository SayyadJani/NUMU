# NUMU — Phase 1: System Foundation & Architecture Specification

## 1. Executive Overview

Phase 1 establishes the production monorepo foundation, developer workflow, persistence layer, backend application framework, and initial frontend architecture for **NUMU** — a developer-learning platform designed for aspiring engineers, students, and competitive programmers.

The primary objective of Phase 1 was to create a scalable, clean, type-safe, and modular base architecture with zero technical debt, enabling subsequent feature phases (Phase 2: Authentication & User Management, Phase 3: DSA Engine & Execution Sandbox, Phase 4: Contests & Assessments) to be built upon a robust foundation.

---

## 2. Monorepo Architecture & Toolchain

NUMU is structured as a high-performance monorepo using **Turborepo** and **pnpm workspaces**.

```
numu/
├── apps/
│   ├── api/                      # Backend API (NestJS 11, Express, Swagger)
│   └── web/                      # Frontend Web App (Next.js 15, React 19, Tailwind CSS v4)
├── packages/
│   ├── database/                 # Prisma ORM 6 schema, migration scripts, and client
│   ├── types/                    # Shared TypeScript interfaces and domain contracts
│   ├── config-eslint/            # Shared ESLint 9 flat configurations
│   └── config-typescript/        # Shared tsconfig bases for library, node, and react
├── docs/                         # Architecture and phase specifications
├── compose.yaml                  # Docker Compose configuration for local services (PostgreSQL 16)
├── turbo.json                    # Turborepo task orchestration and build caching
├── pnpm-workspace.yaml           # pnpm package boundary declaration
└── package.json                  # Root monorepo script runner
```

### Monorepo Tooling Configuration

| Component | Technology | Rationale |
|---|---|---|
| **Package Manager** | `pnpm` (>=10.x) | Strict content-addressable storage, symlinked `node_modules` preventing phantom dependencies, fast deterministic installs. |
| **Monorepo Build Engine** | `Turborepo` (>=2.x) | Remote & local caching, topological task execution, declarative task pipeline in `turbo.json`. |
| **Compiler / Language** | `TypeScript` (5.x) | End-to-end type safety across client, server, and database queries. |
| **Linting System** | `ESLint 9` (Flat Config) | Modular shared configs (`@numu/config-eslint`) unifying code standards across all workspace packages. |
| **Formatting** | `Prettier 3.x` | Consistent code style enforced across the entire repository. |

---

## 3. Shared Workspace Packages

### 3.1. Database Package (`@numu/database`)
- **Path**: `packages/database`
- **Responsibilities**:
  - Prisma schema definition (`prisma/schema.prisma`).
  - Migration management and version-controlled migration history (`prisma/migrations`).
  - Database seed scripts (`src/seed.ts`).
  - Exported canonical `PrismaClient` instance and types for consumption by `@numu/api`.

### 3.2. Types Package (`@numu/types`)
- **Path**: `packages/types`
- **Responsibilities**:
  - Pure TypeScript domain contracts, enums, API request/response payloads.
  - Zero runtime dependencies to prevent bloat in frontend or backend bundles.
  - Acts as the single source of truth for cross-tier data models.

### 3.3. Config Packages (`@numu/config-eslint`, `@numu/config-typescript`)
- **Path**: `packages/config-eslint`, `packages/config-typescript`
- **Responsibilities**:
  - Reusable ESLint configs (`base`, `next`) supporting flat configuration files (`eslint.config.mjs`).
  - Modular TypeScript configurations (`tsconfig.base.json`, `tsconfig.node.json`, `tsconfig.react.json`).

---

## 4. Backend Architecture (`@numu/api`)

The backend is built with **NestJS 11** on Node.js 20+, adhering to modular, clean architecture principles.

### 4.1. Core Application Structure
- **App Module (`src/app.module.ts`)**: Central dependency injection container combining:
  - `ConfigModule`: Global environment variable loading from `apps/api/.env` and `.env.local`.
  - `ThrottlerModule`: Global rate limiting (100 requests per 60 seconds per IP).
  - `PrismaModule`: Database connectivity lifecycle provider.
  - `HealthModule`: Liveness and readiness health-check probes.
- **Entrypoint (`src/main.ts`)**:
  - Global route prefixing: all REST APIs are served under `/api/v1`.
  - Global `ValidationPipe` with `whitelist: true` and `transform: true` to prevent payload injection and enforce runtime DTO validation.
  - OpenAPI / Swagger documentation mounted at `/api/docs`.
  - Secure cookie parsing middleware integration.

### 4.2. Database Service (`src/prisma/prisma.service.ts`)
- Extends Prisma's generated `PrismaClient`.
- Implements NestJS lifecycle interfaces:
  - `onModuleInit()`: Connects to PostgreSQL on boot.
  - `onModuleDestroy()`: Disconnects cleanly on process termination, preventing connection pool exhaustion.

### 4.3. Health & Monitoring Module (`src/modules/health`)
- Exposes `GET /api/v1/health`.
- Performs a live `SELECT 1` query via `prisma.$queryRaw` to verify active database connectivity.
- Returns JSON payload:
  ```json
  {
    "status": "ok",
    "timestamp": "2026-10-15T15:00:00.000Z",
    "uptime": 124.5,
    "database": "ok",
    "version": "1.0.0"
  }
  ```

---

## 5. Frontend Architecture (`@numu/web`)

The user interface is built using **Next.js 15 (App Router)** with **React 19** and **Tailwind CSS v4**.

### 5.1. UI & Design System
- Dark-mode-first aesthetic with custom CSS tokens, modern typography, glassmorphism cards, and interactive hover states.
- Clean layout architecture featuring a responsive sidebar, persistent navigation header, and modular dashboard widgets.

### 5.2. Core Route Hierarchy Established in Phase 1
- `/` — Platform landing page showcasing learning paths and features.
- `/dashboard` — Main student learning hub (progress, recommended challenges, recent activity).
- `/dashboard/dsa` — Data Structures & Algorithms topic hub (arrays, trees, graphs, dynamic programming).
- `/dashboard/contests` — Contest participation and contest registration dashboard.
- `/dashboard/tests` — Assessment and mock interview testing interface.
- `/dashboard/leaderboard` — Global and college student ranking tables.
- `/dashboard/projects` — Guided real-world fullstack projects.
- `/dashboard/notes` — Student code snippets, revisions, and bookmark management.
- `/dashboard/community` — Discussion forums and peer peer-learning channels.
- `/profile/[username]` — Public developer profile and statistics showcase.
- `/login` & `/register` — Authentication portals.

### 5.3. Client-Side API Communication (`src/lib/api/api-client.ts`)
- Centralized fetch wrapper handling:
  - Base URL configuration (`NEXT_PUBLIC_API_URL` falling back to `http://localhost:4000/api/v1`).
  - Automatic `Content-Type: application/json` headers.
  - `credentials: 'include'` for cross-origin cookie transmission.
  - Standardized error parsing.

---

## 6. Infrastructure & Local Development Setup

### 6.1. Containerized Persistence
Local PostgreSQL is provided via Docker Compose (`compose.yaml`):

```yaml
services:
  postgres:
    image: postgres:16-alpine
    container_name: numu-postgres
    restart: unless-stopped
    ports:
      - '5432:5432'
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgrespassword
      POSTGRES_DB: numu
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U postgres -d numu']
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
```

### 6.2. Environment Configuration
- Root `.env` / `apps/api/.env`:
  ```env
  DATABASE_URL="postgresql://postgres:postgrespassword@localhost:5432/numu?schema=public"
  PORT=4000
  NODE_ENV=development
  CORS_ORIGIN="http://localhost:3000"
  ```
- `apps/web/.env.local`:
  ```env
  NEXT_PUBLIC_API_URL="http://localhost:4000/api/v1"
  ```

---

## 7. Developer Workflow & Pipeline Commands

Turborepo orchestrates all workspace tasks across packages:

```bash
# 1. Install all dependencies across workspaces
pnpm install

# 2. Start PostgreSQL container
docker compose up -d

# 3. Synchronize database schema & generate Prisma client
pnpm db:generate
pnpm db:push

# 4. Seed database with baseline data
pnpm db:seed

# 5. Start all apps in watch/development mode
pnpm dev

# 6. Run comprehensive verification
pnpm lint          # ESLint across all 4 packages (0 errors, 0 warnings)
pnpm typecheck     # TypeScript strict compilation (tsc --noEmit)
pnpm test          # Jest unit test suite
pnpm build         # Production builds of Next.js & NestJS apps
```

---

## 8. Phase 1 Verification & Acceptance Criteria

| Criteria | Verification Target | Status |
|---|---|---|
| **PostgreSQL Container** | Docker Alpine 16 running on port 5432 with persistent volume | ✅ Verified |
| **Database Connectivity** | Prisma client successfully queries PostgreSQL database | ✅ Verified |
| **API Health Probe** | `GET http://localhost:4000/api/v1/health` returns `200` & `database: "ok"` | ✅ Verified |
| **Swagger Documentation** | Interactive Swagger UI loaded at `http://localhost:4000/api/docs` | ✅ Verified |
| **Global Validation** | Invalid inputs rejected by `ValidationPipe` with descriptive errors | ✅ Verified |
| **Frontend Compilation** | Next.js 15 App Router renders all 27 pages without SSR errors | ✅ Verified |
| **Monorepo Build Integrity** | `pnpm build` creates production bundles without type or lint errors | ✅ Verified |

---

## 9. Foundation Summary for Subsequent Phases

Phase 1 provides the clean monorepo, database client, and service container necessary for:
- **Phase 2 (Completed)**: Authentication, Argon2id password hashing, rotating refresh tokens, profiles, and organization multi-tenancy.
- **Phase 3 (Next)**: DSA problem repository, test-case management, and isolated code execution sandbox.
- **Phase 4**: Assessments, college-specific contests, and real-time contest leaderboards.

