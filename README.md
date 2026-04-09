# AI Business OS

A production-ready full-stack CRM and business management platform with AI superpowers, built as an alternative to Bitrix24.

## Features

- **Authentication**: JWT-based login and registration
- **Clients**: Full CRUD with search, status management, and AI reply suggestions
- **Deals**: Sales pipeline management with status tracking (New, Negotiation, Won, Lost, On Hold)
- **Tasks**: Task management with priority levels, status filters, and deadline tracking
- **Dashboard**: Real-time analytics, deal pipeline visualization, and activity feed
- **AI Reply Suggestions**: AI-generated professional responses to client messages (powered by OpenAI)
- **AI Deal Analysis**: Predict deal success probability with actionable recommendations

## Tech Stack

- **Frontend**: React + Vite + Tailwind CSS + shadcn/ui
- **Backend**: Express (TypeScript)
- **Database**: PostgreSQL + Drizzle ORM
- **API**: OpenAPI spec with generated TypeScript types and React Query hooks
- **Auth**: JWT authentication with bcrypt password hashing
- **AI**: OpenAI GPT-4o-mini integration

## Setup

### Prerequisites

- Node.js 20+
- pnpm 9+
- PostgreSQL database
- OpenAI API key (optional, for AI features)

### Environment Variables

```env
DATABASE_URL=postgresql://user:password@localhost:5432/ai_business_os
SESSION_SECRET=your-secret-key-here
OPENAI_API_KEY=sk-your-openai-api-key    # Required for AI features
```

### Installation

```bash
# Install dependencies
pnpm install

# Push database schema
pnpm --filter @workspace/db run push

# Start development
pnpm --filter @workspace/api-server run dev   # Backend on port 8080
pnpm --filter @workspace/ai-business-os run dev  # Frontend on port 19851
```

### API Endpoints

#### Authentication
- `POST /api/auth/register` — Register new user
- `POST /api/auth/login` — Login
- `GET /api/auth/me` — Get current user

#### Clients
- `GET /api/clients` — List all clients
- `POST /api/clients` — Create client
- `GET /api/clients/:id` — Get client
- `PATCH /api/clients/:id` — Update client
- `DELETE /api/clients/:id` — Delete client

#### Deals
- `GET /api/deals` — List all deals
- `POST /api/deals` — Create deal
- `GET /api/deals/:id` — Get deal
- `PATCH /api/deals/:id` — Update deal
- `DELETE /api/deals/:id` — Delete deal

#### Tasks
- `GET /api/tasks` — List all tasks
- `POST /api/tasks` — Create task
- `GET /api/tasks/:id` — Get task
- `PATCH /api/tasks/:id` — Update task
- `DELETE /api/tasks/:id` — Delete task

#### Dashboard
- `GET /api/dashboard/summary` — Get stats summary
- `GET /api/dashboard/deal-pipeline` — Get pipeline breakdown
- `GET /api/dashboard/recent-activity` — Get activity feed

#### AI Features
- `POST /api/ai/suggest-reply` — Generate AI reply for client message
- `POST /api/ai/analyze-deal` — Analyze deal success probability

### AI Features Setup

To enable AI features, add your OpenAI API key to your environment:

```bash
export OPENAI_API_KEY=sk-your-key-here
```

Without the key, AI endpoints will return a 500 error with a descriptive message. All other features work without an API key.

## Database Schema

```sql
users (id, email, password, name, created_at, updated_at)
clients (id, name, email, phone, company, status, created_at, updated_at)
deals (id, title, value, status, client_id, notes, created_at, updated_at)
tasks (id, title, description, status, priority, deadline, deal_id, client_id, created_at, updated_at)
```
