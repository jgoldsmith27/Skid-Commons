# Skid Commons (MVP)

Minimal but extensible group chat app with auth-lite, realtime messaging, and OpenAI-backed assistant.

## Stack
- TypeScript everywhere
- Backend: Fastify + Socket.IO + Prisma + SQLite
- Frontend: React + Vite
- Shared contracts: `packages/shared`

## Implemented Patterns
- Repository Pattern: interfaces in `apps/server/src/domain/repositories` and Prisma implementations in `apps/server/src/infra/repositories`
- Service Layer Pattern: business logic in `apps/server/src/domain/services`
- Controller/Router Pattern: controllers in `apps/server/src/http/controllers`, route wiring in `apps/server/src/http/routes.ts`
- Adapter Pattern: `LLMClient` interface + `OpenAIClient` implementation in `apps/server/src/infra/llm`
- Observer/Pub-Sub Pattern: `EventBus` abstraction and socket-backed emitter in `apps/server/src/infra/realtime`
- DTO Pattern: zod schemas in `apps/server/src/http/dtos`
- Factory Pattern: manual DI in `apps/server/src/di/container.ts`

## Requirements
- Node.js 20+
- npm 10+

## Environment Variables
Create `apps/server/.env`:

```bash
OPENAI_API_KEY=your_openai_api_key
JWT_SECRET=replace_me
DATABASE_URL="file:./dev.db"
PORT=3001
WEB_ORIGIN=http://localhost:5173
```

For web (optional), create `apps/web/.env`:

```bash
VITE_API_URL=http://localhost:3001
```

## Setup
```bash
npm install
npm run db:generate
npm run db:migrate
```

If `db:migrate` fails in your environment, use:
```bash
cd apps/server
npx prisma db push --schema src/infra/prisma/schema.prisma
cd ../..
```

## Run
```bash
npm run dev
```

- Server: `http://localhost:3001`
- Web: `http://localhost:5173`

## View Database Records
SQLite DB file is at `apps/server/dev.db` (because `DATABASE_URL=\"file:./dev.db\"` is resolved from `apps/server`).

Option 1: Prisma Studio (recommended)
```bash
cd apps/server
npx prisma studio --schema src/infra/prisma/schema.prisma
```
Then open the URL it prints (usually `http://localhost:5555`) and browse `User`, `Chat`, `ChatParticipant`, `Message`.

Option 2: sqlite3 terminal
```bash
cd apps/server
sqlite3 dev.db
```
Inside sqlite:
```sql
.tables
SELECT id, accountId, displayName, createdAt FROM User;
SELECT id, title, createdAt, createdByUserId FROM Chat;
SELECT chatId, userId, role, createdAt FROM ChatParticipant;
SELECT id, chatId, authorUserId, authorType, content, createdAt FROM Message ORDER BY createdAt DESC LIMIT 50;
```
Exit with:
```sql
.quit
```

Option 3: quick one-liner query
```bash
cd apps/server
sqlite3 -header -column dev.db \"SELECT id, accountId, displayName FROM User;\"
```

## API Summary
- `POST /api/auth/register` `{ accountId, displayName }`
- `POST /api/auth/login` `{ accountId }`
- `GET /api/chats`
- `POST /api/chats` `{ title? }`
- `POST /api/chats/:chatId/share` `{ targetAccountId }`
- `GET /api/chats/:chatId/participants`
- `GET /api/chats/:chatId/messages`
- `POST /api/chats/:chatId/messages` `{ content }`

## Realtime Events
Client -> Server:
- `auth { token }`
- `chat:join { chatId }`
- `chat:leave { chatId }`

Server -> Client:
- `chat:messageCreated { chatId, message }`
- `chat:participantAdded { chatId, user }`
- `error { code, message }`

## Notes
- Auth is intentionally MVP-grade: JWT with accountId login, no password.
- Assistant prompt logic is participant-aware:
  - one participant: does not mention multi-participant/group-chat context
  - multiple participants: includes roster and user metadata for disambiguation
