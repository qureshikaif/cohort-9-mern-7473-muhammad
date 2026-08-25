# SonarQube

Static analysis for this project is run locally with SonarQube Community in Docker.
This folder holds the report and the screenshots from that run.

## How to reproduce it

Start the server:

```bash
docker run -d --name sonarqube -p 9000:9000 sonarqube:community
```

Open http://localhost:9000, log in with `admin` / `admin`, change the password when it
asks, then create a token under My Account > Security.

Generate the coverage reports that Sonar reads:

```bash
cd backend && npm run test:coverage
cd ../frontend && npm run test:coverage
```

The backend run needs the test database, same as `npm run test:integration`.

Scan from the repository root:

```bash
docker run --rm -v "$(pwd):/usr/src" sonarsource/sonar-scanner-cli \
  -Dsonar.host.url=http://host.docker.internal:9000 \
  -Dsonar.token=YOUR_TOKEN
```

On Linux use `--network host` and `http://localhost:9000` instead of
`host.docker.internal`. Results appear at
http://localhost:9000/dashboard?id=notes-app

Use the `sonarqube:community` tag, not `lts-community`. The LTS image ships an older
TypeScript that cannot read the frontend tsconfig, and it silently skips the whole
React source instead of failing.

## Config

`sonar-project.properties` in the repository root. It covers both projects, points at
the two lcov files, and skips the generated Prisma client. Tailwind's `@theme` and
`@utility` at-rules are excluded from the CSS rule that does not know them.

## Files here

| File | What it is |
|---|---|
| `report.md` | Metrics and issues from the run |
| `screenshots/` | Dashboard screenshots from localhost:9000 |
