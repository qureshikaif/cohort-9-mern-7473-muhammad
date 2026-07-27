# Backend

Node.js + Express 5 + TypeScript API. PostgreSQL via Prisma, JWT auth helpers,
pino logging, and Socket.IO wired to the same HTTP server for future real-time
features. Unit tests run on Mocha + Chai.

## Getting started

```bash
cd backend
npm install
cp .env.example .env      # set DATABASE_URL and the JWT secrets
npm run prisma:generate   # generate the Prisma client
npm run prisma:migrate    # create the database tables
npm run dev               # tsx watch — hot reload
```

Health check: <http://localhost:5000/api/health>

## Scripts

| Script              | Description                              |
| ------------------- | ---------------------------------------- |
| `npm run dev`             | Start in watch mode (tsx)          |
| `npm run build`           | Compile TypeScript to `dist/`      |
| `npm start`               | Run the compiled server (`dist/`)  |
| `npm run typecheck`       | Type-check the project             |
| `npm test`                | Run unit tests (Mocha + Chai)      |
| `npm run lint`            | Lint with ESLint                   |
| `npm run format`          | Format with Prettier               |
| `npm run prisma:generate` | Generate the Prisma client         |
| `npm run prisma:migrate`  | Create/apply a dev migration       |

## Folder structure

```text
prisma/            Prisma schema (client generates to src/generated/prisma)
test/              Mocha specs (*.spec.ts)
src/
├── config/        Env validation (zod), Prisma client + connection
├── controllers/   Request/response handlers (thin)
├── services/      Business logic (reusable, framework-agnostic)
├── routes/        Express routers (index.ts aggregates them)
├── middlewares/   auth, error, notFound, rateLimit
├── sockets/       Socket.IO setup + handlers (JWT-authed)
├── utils/         jwt, ApiError, asyncHandler, logger (pino)
├── types/         Ambient type augmentation (e.g. req.user)
├── generated/     Prisma-generated client (gitignored)
├── app.ts         Express app assembly (testable)
└── server.ts      Bootstrap: DB → HTTP + Socket.IO → listen
```

## Conventions

- **Controllers stay thin.** Put logic in `services/` so it can be reused by both
  HTTP routes and Socket.IO handlers.
- **Throw `ApiError`** (e.g. `ApiError.notFound()`) — the error middleware formats it.
- **Wrap async handlers** in `asyncHandler()` (or rely on Express 5's built-in
  promise rejection forwarding).
- **Env is validated at boot** in `config/env.ts`; the process exits if invalid.

## Adding a feature (pattern)

1. Add the model to `prisma/schema.prisma`, then `npm run prisma:migrate`
2. `services/thing.service.ts` — logic (uses the `prisma` client from `config`)
3. `controllers/thing.controller.ts` — HTTP glue
4. `routes/thing.routes.ts` — router
5. Register it in `routes/index.ts`: `router.use('/things', thingRoutes);`
