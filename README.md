# Notes App

A notebook style notes app, written for the 10Pearls cohort 9 MERN assignment.
Express and Prisma on the server, React and Vite in the browser, PostgreSQL
underneath. The two halves live in `backend/` and `frontend/` and run as separate
processes in development.

## What it does

Accounts use an email and a password, with a short lived access token and a longer
refresh token. Once you are in you get:

- notes with a rich text editor, plus search, three sort orders and a grid or list layout
- an overview page with a word count, a longest note figure and a bar chart of the last seven days
- share a note by link. Anyone with the link can read and edit it, and both sides see
  changes as they happen over a websocket
- export everything as JSON, Markdown, plain text or HTML, and import back from JSON,
  `.md` or `.txt`
- change your password from the profile page
- a collapsible sidebar that remembers whether you left it open

## What you need first

Node 20.19 or newer, and a PostgreSQL server you can create databases on. Docker is
only needed if you want to run the SonarQube scan.

## Setting it up

Clone the repo, then do the backend:

```bash
cd backend
npm install
cp .env.example .env
```

Open `.env` and fill in the two JWT secrets. They have to be at least 32 characters
and different from each other, and the server will refuse to start otherwise:

```bash
openssl rand -hex 32
```

Point `DATABASE_URL` at a database that exists, then create the tables:

```bash
npm run prisma:migrate
```

Now the frontend, in a second terminal:

```bash
cd frontend
npm install
cp .env.example .env
```

## Running it

```bash
cd backend && npm run dev     # http://localhost:8080
cd frontend && npm run dev    # http://localhost:5173
```

Open http://localhost:5173. Vite proxies `/api` through to the backend, so the
frontend does not need to know the API host at runtime. The websocket does not go
through the proxy and connects straight to port 8080.

## Environment variables

Backend, in `backend/.env`:

| Name | What it is |
|---|---|
| `NODE_ENV` | `development`, `test` or `production` |
| `PORT` | Port the API listens on, 8080 by default |
| `CLIENT_URL` | Allowed CORS origin, and the same for the websocket |
| `DATABASE_URL` | A direct `postgresql://` connection string |
| `JWT_ACCESS_SECRET` | 32 characters or more |
| `JWT_REFRESH_SECRET` | 32 characters or more, and not the same as the access one |
| `JWT_ACCESS_EXPIRES_IN` | Access token lifetime, `15m` by default |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token lifetime, `7d` by default |

Frontend, in `frontend/.env`:

| Name | What it is |
|---|---|
| `VITE_API_URL` | Where the browser sends API calls, `/api` so the proxy picks it up |
| `BACKEND_URL` | Where Vite forwards `/api` during development |
| `VITE_SOCKET_URL` | Websocket host. Optional, defaults to `http://localhost:8080` |

Both `.env` files are gitignored. The `.env.example` files are the ones in the repo.

## Scripts

Backend:

| Command | What it does |
|---|---|
| `npm run dev` | Start the API with reload on save |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run the compiled build |
| `npm test` | Unit tests |
| `npm run test:integration` | Integration tests against a real database |
| `npm run test:coverage` | Both suites with coverage and test reports |
| `npm run typecheck` | Types only, no output |
| `npm run lint` | ESLint |
| `npm run prisma:migrate` | Apply migrations in development |
| `npm run prisma:generate` | Regenerate the Prisma client |

Frontend:

| Command | What it does |
|---|---|
| `npm run dev` | Vite dev server |
| `npm run build` | Type check then build to `dist/` |
| `npm run preview` | Serve the build locally |
| `npm test` | Jest |
| `npm run test:coverage` | Jest with coverage |
| `npm run lint` | ESLint |

## Tests

242 tests at the moment: 91 unit and 61 integration on the backend, 90 on the frontend.

The integration tests talk to a real PostgreSQL and empty the `Note` and `User` tables
between suites, so they need a database of their own. Create `backend/.env.test`:

```
INTEGRATION_TEST_DATABASE=true
DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/notes_app_test
```

The `INTEGRATION_TEST_DATABASE=true` line is a guard. Without it the suite refuses to
run, which stops the truncate from ever landing on a database you cared about. Keep
this database separate from the one your dev server uses, or you will lose your notes
every time you run the tests.

Frontend tests use Jest with React Testing Library and jsdom.

## API

Everything is under `/api`. The auth, shared and health routes are open, the rest need
a bearer token.

| Method and path | What it does |
|---|---|
| `POST /api/auth/register` | Create an account |
| `POST /api/auth/login` | Sign in |
| `POST /api/auth/refresh` | Swap a refresh token for a new access token |
| `POST /api/auth/logout` | Sign out |
| `GET /api/users/me` | The signed in user |
| `PATCH /api/users/me/password` | Change password |
| `GET /api/notes` | List notes, takes `search`, `page` and `limit` |
| `POST /api/notes` | Create a note |
| `GET /api/notes/:id` | One note |
| `PATCH /api/notes/:id` | Update a note |
| `DELETE /api/notes/:id` | Delete a note |
| `GET /api/notes/export` | Export, takes `format` of `json`, `md`, `txt` or `html` |
| `POST /api/notes/import` | Import a list of notes |
| `POST /api/notes/:id/share` | Create a share link, or return the existing one |
| `DELETE /api/notes/:id/share` | Revoke the link |
| `GET /api/shared/:token` | Read a shared note, no login needed |
| `PATCH /api/shared/:token` | Edit a shared note, no login needed |
| `GET /api/health` | Health check |

`/api` is rate limited to 100 requests per 15 minutes per IP. Health sits in front of
the limiter so it is never throttled. The limiter is also skipped when `NODE_ENV` is
`test`, otherwise the integration suite trips it partway through.

## How it is put together

```
backend/
  prisma/            schema and migrations
  src/
    config/          env parsing and the Prisma client
    controllers/     request handling
    services/        database work
    routes/          route definitions
    middlewares/     auth, validation, rate limit, error handler
    validators/      zod schemas
    sockets/         Socket.IO setup and the room helpers
    utils/           tokens, hashing, note formatting, logger
  test/              unit specs, and integration/ for the database ones
frontend/
  src/
    pages/           one file per screen
    components/      shared UI
    auth/            auth context and the protected route
    lib/             api client, hooks, helpers
  test/              Jest specs
docs/sonarqube/      the static analysis report
```

Requests come in through `src/app.ts`, which sets up helmet, CORS, compression and the
JSON parser before the routes. Controllers pull the user out of the verified token and
hand off to a service, and every service query is scoped by `authorId` so one account
cannot read another's notes. Anything thrown lands in one error handler that maps
`ApiError` and Zod failures onto status codes and hides stack traces in production.

Note changes are pushed over Socket.IO. Each signed in socket joins a room named after
its user id, so a change made in one tab shows up in the others. Shared links get a
room named after the share token instead, which is how someone without an account can
receive updates.

## Static analysis

There is a SonarQube report in `docs/sonarqube/`, along with the steps to reproduce the
run and screenshots of the dashboard. The scan covers both halves of the project and
reads coverage from the two lcov files.

## Things worth knowing

Tokens are kept in `localStorage`, which is convenient and not what you would ship.
HttpOnly cookies would be the right answer and would need the refresh flow reworked.

Changing your password does not invalidate tokens that were already issued. Doing that
properly needs a token version column on the user.

Two people editing the same shared note at the same time is last write wins. There is
no merging, so the later save overwrites the earlier one.
