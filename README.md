# CodeShare

> **Share text. Share code. Keep it temporary.**

A secure, anonymous, temporary text and code-sharing platform designed for production readiness, minimal overhead, and zero data leakage. Pastes strictly expire and become inaccessible 24 hours after creation.

---

## Features

- **Anonymous by Design**: No user accounts, registration, tracking, or telemetry.
- **24-Hour Expiration**: Enforced at the database query level on every operation, backed by automated hourly background cleanup. Expired pastes return `410 Gone` even before background purge jobs run.
- **Cryptographic Deletion Tokens**: Creators receive a high-entropy secret deletion token allowing immediate early deletion. Only a SHA-256 hash is stored on the server, compared using `crypto.timingSafeEqual` to eliminate timing attacks.
- **Syntax Highlighting & Safe Rendering**: Supports 13 popular programming languages (Plain Text, JavaScript, TypeScript, Python, Java, C, C++, HTML, CSS, JSON, SQL, Bash, Markdown). No code is executed or evaluated.
- **Rate Limiting & Request Guards**: Built-in IP rate limiting, strict payload size validation (configurable up to 512 KB), and Helmet security headers.
- **Production-Grade Architecture**: Express backend, Prisma ORM with PostgreSQL, React + Vite frontend with Tailwind CSS and Monaco Editor, plus full Docker and Docker Compose orchestration.

---

## Tech Stack

- **Backend**: Node.js, Express, TypeScript, Zod, Helmet, CORS, Express-Rate-Limit
- **Database & ORM**: PostgreSQL 16, Prisma ORM
- **Frontend**: React 18, TypeScript (Strict Mode), Vite, Tailwind CSS, Monaco Editor, Lucide Icons
- **Testing**: Vitest, Supertest, Testing Library, JSDOM

---

## Project Structure

```text
web-app/
├── backend/
│   ├── src/
│   │   ├── config/env.ts             # Centralized and validated environment variables
│   │   ├── controllers/              # HTTP request controllers (create, get, delete)
│   │   ├── errors/                   # Typed application error hierarchy (AppError)
│   │   ├── jobs/cleanup.job.ts       # Safe periodic background cleanup runner
│   │   ├── middleware/               # Error handling, rate limiting
│   │   ├── prisma/client.ts          # Prisma client and database health check
│   │   ├── routes/                   # Paste and Health API routes
│   │   ├── services/paste.service.ts # Cryptographic tokens, hashing, expiration checks
│   │   ├── validators/               # Zod validation schemas
│   │   ├── app.ts                    # Express app configuration & middleware
│   │   └── server.ts                 # Bootstrap with graceful shutdown handlers
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/               # Header, Editor, LanguageSelector, Modals
│   │   ├── hooks/                    # useClipboard with secure & fallback support
│   │   ├── pages/                    # HomePage, PasteViewPage
│   │   ├── services/api.ts           # Type-safe API client
│   │   ├── App.tsx                   # Client-side router and state
│   │   ├── main.tsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
├── prisma/
│   ├── schema.prisma                 # PostgreSQL schema with indexes on expiresAt
│   └── migrations/                   # Migration SQL history
├── shared/
│   └── types/paste.ts                # Shared TypeScript models and constants
├── tests/
│   ├── api/                          # End-to-end API tests (Supertest)
│   ├── unit/                         # Cleanup job and service unit tests
│   └── frontend/                     # UI component and clipboard tests
├── docker-compose.yml                # Production multi-service container orchestration
├── Dockerfile                        # Multi-stage production container build
├── .env.example
├── .gitignore
├── package.json
├── vitest.config.ts
└── README.md
```

---

## Quickstart (Development Setup)

### Prerequisites

- Node.js >= 20.x (Node 22 or 24 recommended)
- npm >= 10.x
- PostgreSQL database (or Docker to run PostgreSQL)

### 1. Clone & Install Dependencies

```bash
git clone <repository-url>
cd web-app
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Ensure `DATABASE_URL` points to your PostgreSQL instance:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/codeshare?schema=public
APP_BASE_URL=http://localhost:5173
```

### 3. Generate Prisma Client & Run Migrations

```bash
npm run prisma:generate
npm run prisma:migrate
```

### 4. Run Development Servers

```bash
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3000`

---

## Production Build & Deployment

### Local Production Build

To compile all packages (Shared, Backend, and Frontend):

```bash
npm run build
npm start
```

In production mode, the Express server serves both the REST API at `/api/*` and the compiled frontend single-page application from `frontend/dist`.

### Docker & Docker Compose Deployment

A complete production-ready setup with PostgreSQL and the application container:

```bash
docker compose up -d --build
```

This will:
1. Spin up a PostgreSQL 16 container with persistent volumes and healthchecks.
2. Build the multi-stage Node.js container.
3. Automatically execute `prisma migrate deploy` upon startup.
4. Launch the application at `http://localhost:3000`.

---

## Automated Tests

Run the test suite:

```bash
npm test
```

For continuous testing with watch mode:

```bash
npm run test:watch
```

Test coverage includes:
- **API Tests**: Paste creation, retrieval, missing paste (404), expired paste (410), exact boundary condition, valid deletion token, invalid token (403), empty content, whitespace-only content, oversized content, invalid language, malformed IDs, rate limiting, and database error sanitization.
- **Unit Tests**: Overlapping cleanup prevention, database disconnection resilience, cryptographic hashing.
- **Frontend Tests**: Header rendering, language selection, status banners, deletion modals, clipboard copying, and fallback handling.

---

## Security Model & Protections

1. **Deletion Token Hashing**: When a paste is created, a high-entropy deletion token is generated using `crypto.randomBytes(24).toString('base64url')`. The raw token is returned only once to the creator and is never persisted. Only the SHA-256 hash is stored in the database.
2. **Timing-Safe Equality**: Deletion tokens are verified using `crypto.timingSafeEqual` to protect against side-channel timing analysis attacks.
3. **No Code Execution**: Content is treated strictly as plain text or syntax-highlighted code tokens. Arbitrary HTML/script execution is prevented across both backend and frontend.
4. **Header Hardening**: Configured with Helmet for strict Content-Security-Policy (CSP), HTTP Strict Transport Security (HSTS), X-Content-Type-Options (`nosniff`), and frame protections (`deny`).
5. **Rate Limiting**: Configured with IP-based rate limiters to prevent resource exhaustion and abuse.
6. **No Information Leakage**: Database error details and stack traces are suppressed in production. Deletion tokens and hashes are excluded from retrieval endpoints and logs.

---

## Database Backup and Recovery Considerations

1. **Automated Logical Backups**:
   Schedule daily logical backups using `pg_dump`:
   ```bash
   pg_dump -U postgres -d codeshare -Fc -f /backup/codeshare_$(date +%Y%m%d_%H%M%S).dump
   ```
2. **Restoration**:
   ```bash
   pg_restore -U postgres -d codeshare -c -v /backup/codeshare_YYYYMMDD_HHMMSS.dump
   ```
3. **Point-In-Time Recovery (PITR)**:
   For high-scale deployments, enable PostgreSQL Write-Ahead Logging (WAL) archiving to an S3-compatible bucket.
4. **Data Retention & Expiry**:
   Because pastes expire after 24 hours, backups primarily serve for disaster recovery rather than long-term historical archiving.

---

## License

MIT

