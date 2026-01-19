# Candidate Interview App

Lightweight one-shot interview app that records answers to 5 questions and returns an immutable AI-generated feedback record evaluating three skills: Communication, Problem Solving, and Empathy.

### Quick Links

- Repo root: [README.md](README.md)
- Docker Compose: [`docker-compose.yml`](docker-compose.yml)
- Backend: [backend/README.md](backend/README.md) — main NestJS service
- Frontend: [frontend/README.md](frontend/README.md) — React + Vite UI
- Questions constant: [`INTERVIEW_QUESTIONS`](backend/interviews/constants/questions.ts)
- AI analysis: [`AiAnalysisService`](backend/ai/ai-analysis.service.ts)
- Auth controller/service/strategy: [`AuthController`](backend/src/auth/auth.controller.ts), [`AuthService`](backend/src/auth/auth.service.ts), [`JwtStrategy`](backend/src/auth/jwt.strategy.ts)
- Interviews flow: [`InterviewsController`](backend/interviews/interviews.controller.ts), [`InterviewsService`](backend/interviews/interviews.service.ts), [`SubmitInterviewDto`](backend/interviews/dto/submit-interview.dto.ts)
- DB schemas: [`Interview`](backend/interviews/schemas/interview.schema.ts), [`Feedback`](backend/interviews/schemas/feedback.schema.ts), [`User`](backend/src/users/user.schema.ts)
- Frontend auth pieces: [`AuthContext`](frontend/src/auth/AuthContext.tsx), [`api` client interceptor](frontend/src/api/client.ts)
- Tests: [backend/test](backend/test), [frontend/e2e](frontend/e2e)
- AI Usage disclosure: [AI_USAGE.md](AI_USAGE.md)

### What this project is

- 5 fixed interview questions — see [`INTERVIEW_QUESTIONS`](backend/interviews/constants/questions.ts).
- Users register/login (JWT). One user → at most one completed interview; responses and feedback are immutable.
- Backend analyzes answers via AI through [`AiAnalysisService`](backend/ai/ai-analysis.service.ts). If OpenAI is not configured, a deterministic mock is used.

### Requirements

- Node 18+ / NPM or PNPM
- Docker & Docker Compose (recommended for full stack)
- OpenAI API key for real AI analysis

Local setup ( Docker Compose )
Bring the full stack up:

```sh
docker-compose up --build
```

- Frontend served by the frontend container (nginx) — see [frontend/Dockerfile](frontend/Dockerfile).
- Backend service listens on port 4000 inside container, base API path is /api (see [`backend/src/main.ts`](backend/src/main.ts)).

Local dev (without Docker)

- Backend

  ```sh
  cd backend
  npm install
  npm run start:dev
  ```

  - DB: point MONGO_URI at a running Mongo instance (or use `mongodb-memory-server` for tests).
  - Config: see [`backend/config/configuration.ts`](backend/config/configuration.ts) and [`backend/database/database.module.ts`](backend/database/database.module.ts).

- Frontend
  ```sh
  cd frontend
  npm install
  npm run dev
  ```
  - Frontend uses Vite; API base is configured in [`frontend/src/api/client.ts`](frontend/src/api/client.ts) via VITE_API_BASE_URL.

### API surface (important endpoints)

- Auth
  - POST /api/auth/register -> [`AuthController.register`](backend/src/auth/auth.controller.ts)
  - POST /api/auth/login -> [`AuthController.login`](backend/src/auth/auth.controller.ts)
  - GET /api/auth/me -> [`AuthController.me`](backend/src/auth/auth.controller.ts) (protected by JWT)
- Interviews
  - GET /api/interviews/questions -> returns [`INTERVIEW_QUESTIONS`](backend/interviews/constants/questions.ts)
  - POST /api/interviews -> submit interview (validated by [`SubmitInterviewDto`](backend/interviews/dto/submit-interview.dto.ts)), handled by [`InterviewsController.submit`](backend/interviews/interviews.controller.ts)
  - GET /api/interviews -> history (handled by [`InterviewsController.history`](backend/interviews/interviews.controller.ts))
  - GET /api/interviews/:id -> detail (handled by [`InterviewsController.detail`](backend/interviews/interviews.controller.ts))

# Architecture notes

### Frontend

- React + TypeScript + Vite. App entry: [`frontend/src/main.tsx`](frontend/src/main.tsx). Routes live in [`frontend/src/App.tsx`](frontend/src/App.tsx).
- Auth state & hydration via [`AuthContext`](frontend/src/auth/AuthContext.tsx). Axios client interceptor attaches JWT from localStorage: [`frontend/src/api/client.ts`](frontend/src/api/client.ts).
- UI is stateless regarding interview persistence: the server enforces the one-time rule; UI checks [`hasInterviewHistory()`](frontend/src/api/interviews.api.ts) to guide navigation.

### Backend

- NestJS monolith structured into modules: Auth, Interviews, AI, Health, Database. App module: [`backend/src/app.module.ts`](backend/src/app.module.ts).
- Validation: global ValidationPipe is configured in [`backend/src/main.ts`](backend/src/main.ts) and DTOs (e.g., [`SubmitInterviewDto`](backend/interviews/dto/submit-interview.dto.ts)) enforce input constraints.
- JWT auth: configured in [`backend/src/auth/auth.module.ts`](backend/src/auth/auth.module.ts), sign/verify via `JWT_SECRET`.
- AI analysis: [`AiAnalysisService`](backend/ai/ai-analysis.service.ts) uses `ANALYSIS_PROVIDER` to select `mock` or `openai`. OpenAI integration posts to the Chat Completions endpoint and strictly expects a JSON schema — see [`backend/ai/ai-analysis.service.ts`](backend/ai/ai-analysis.service.ts).

### Database & data model

- MongoDB with Mongoose; connection logic in [`backend/database/database.module.ts`](backend/database/database.module.ts).
- Schemas:
  - User: [`User`](backend/src/users/user.schema.ts)
  - Interview: [`Interview`](backend/interviews/schemas/interview.schema.ts) — stores questions & answers snapshot; immutable
  - Feedback: [`Feedback`](backend/interviews/schemas/feedback.schema.ts) — stores scores + explanations; immutable
- Immutability & access control:
  - Interviews and feedback are created once and never updated by design. The backend enforces that only the owner can read interview details: see [`InterviewsService.getInterviewDetail`](backend/interviews/interviews.service.ts).

### Testing

- Backend unit tests and e2e tests: [backend/test](backend/test). E2E uses `mongodb-memory-server` in tests (see `backend/test/*e2e-spec.ts`).
- Frontend E2E: Playwright tests under `frontend/e2e` (config: [`frontend/playwright.config.ts`](frontend/playwright.config.ts)).
- CI suggestion: run backend unit & e2e, and Playwright tests against a deployed test environment.

### Operational notes

- Logging: AI errors and other warnings are logged by services such as [`AiAnalysisService`](backend/ai/ai-analysis.service.ts).
- Health: `/api/health` endpoint is implemented by [`HealthController`](backend/health/health.controller.ts).
- Deploy: Dockerfiles for frontend and backend provided (`frontend/Dockerfile`, `backend/Dockerfile`). Compose for local stacks: [`docker-compose.yml`](docker-compose.yml).

# Ethical, privacy & safety considerations (must-read)

- Candidate privacy

  - Candidate answers are stored persistently in MongoDB. Data is immutable by design to preserve auditability.
  - Protect secrets like `OPENAI_API_KEY`, `JWT_SECRET` via environment variables. Please note, I have commited the backend.env file for ease of testing once docker is up and running. But definitely better to use a secrets manager.
  - Implement retention and deletion policies before production use.

- Bias & fairness of AI feedback

  - The AI-generated scores from [`AiAnalysisService`](backend/ai/ai-analysis.service.ts) can encode model biases.
  - AI feedback must be treated merely input based and to be considered advisory only.
  - Mitigations:
    - Log prompts and model outputs (audit trail) so feedback can be re-evaluated.
    - Use strict prompting to restrict responses in JSON.
    - Validate and clamp scores (0–100) in [`AiAnalysisService`](backend/ai/ai-analysis.service.ts) using `clamp()` to avoid invalid values for us to maintain the scores between 0 and 100.

- Security

  - Input validation: DTOs + global ValidationPipe (`backend/src/main.ts`) are enabled.
  - Auth: passwords hashed with bcrypt in [`AuthService`](backend/src/auth/auth.service.ts) and use of tokens via JWT.
  - Rate limiting: not enabled by default, but recommended in production.
  - Network security: expose only required ports, use TLS and reverse proxy in production.

### Next steps

- Add human review workflow and export/anonymization features.
- Implement rate limiting and monitoring (prometheus/logging).
- Add more granular audit logging for AI prompts and outputs.
- Consider adding admin UI for question management if scope changes.
