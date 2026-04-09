# AI Business OS

## Overview

A production-ready full-stack CRM and business management platform with AI superpowers. Think Bitrix24 meets GPT — built for teams who want speed and intelligence in one tool.

## Architecture

### Stack
- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9

### Frontend (`artifacts/ai-business-os`)
- React + Vite + Tailwind CSS + shadcn/ui
- wouter for routing
- TanStack React Query for data fetching
- Recharts for data visualization

### Backend (`artifacts/api-server`)
- Express 5 (TypeScript)
- PostgreSQL via Drizzle ORM
- JWT auth (jsonwebtoken + bcryptjs)
- OpenAI GPT-4o-mini for AI features
- Pino for structured logging

### Database (`lib/db`)
- PostgreSQL + Drizzle ORM
- Tables: users, clients, deals, tasks

### API Contract (`lib/api-spec`)
- OpenAPI 3.1 spec in `lib/api-spec/openapi.yaml`
- Codegen: React Query hooks → `lib/api-client-react`
- Codegen: Zod validation schemas → `lib/api-zod`

## Key Features

1. **Auth**: JWT login/register (stored in localStorage as `ai_bos_token`)
2. **Clients**: CRUD with search, status (active/inactive/prospect)
3. **Deals**: Sales pipeline (new/negotiation/won/lost/on_hold)
4. **Tasks**: Task management with priority/status/deadline
5. **Dashboard**: Stats summary, deal pipeline chart, activity feed
6. **AI Reply**: OpenAI-powered client message reply suggestions
7. **AI Deal Analysis**: Success probability prediction with recommendations

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally
- `pnpm --filter @workspace/ai-business-os run dev` — run frontend locally

## Environment Variables Required

- `DATABASE_URL` — PostgreSQL connection string (auto-provisioned)
- `SESSION_SECRET` — JWT signing secret (set in env)
- `OPENAI_API_KEY` — OpenAI API key (required for AI features only)

## Routes

| Path | Description |
|------|-------------|
| `/login` | Login page |
| `/register` | Register page |
| `/dashboard` | Main dashboard |
| `/clients` | Client list |
| `/clients/:id` | Client detail + AI reply |
| `/deals` | Deal pipeline |
| `/deals/:id` | Deal detail + AI analysis |
| `/tasks` | Task management |

## API Endpoints

- `POST /api/auth/register` — Register
- `POST /api/auth/login` — Login
- `GET /api/auth/me` — Current user
- `GET/POST /api/clients` — Client CRUD
- `GET/PATCH/DELETE /api/clients/:id`
- `GET/POST /api/deals` — Deal CRUD
- `GET/PATCH/DELETE /api/deals/:id`
- `GET/POST /api/tasks` — Task CRUD
- `GET/PATCH/DELETE /api/tasks/:id`
- `GET /api/dashboard/summary` — Stats
- `GET /api/dashboard/deal-pipeline` — Pipeline
- `GET /api/dashboard/recent-activity` — Activity feed
- `POST /api/ai/suggest-reply` — AI reply suggestion
- `POST /api/ai/analyze-deal` — AI deal analysis

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
