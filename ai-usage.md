# AI Usage Disclosure

This document explains where, how, and why I used AI coding assistants during this project, and how their outputs were reviewed or overridden. My main intent was to use AI as an accelerator, and not as a decision-maker.

## Tools used

- ChatGPT and CoPilot — general-purpose coding assistants
- IDE autocomplete — for boilerplate and syntax help

No automated generators were used to produce entire features without review.

## 1. Project scaffolding & boilerplate

**What I used AI for**

- Creating initial NestJS module and controller scaffolding
- Drafting basic Dockerfiles and a Docker Compose layout
- Scaffolding placeholder frontend components and routing skeletons

**Why**
These tasks are setup related, and using AI reduced time and freed focus for architecture and behaviour decisions.

**Example prompts**

- “Generate a basic NestJS module structure for authentication using JWT”
- “Create a Docker Compose file with Node.js backend, React frontend, and MongoDB”
- “Scaffold a React and TypeScript page layout for a multi-step form”

**Validation and adjustments**
All generated files were manually reviewed and refactored to match project conventions. Paths, ports, and environment variables were verified by running containers locally.

## 2. Docker & containerization troubleshooting

**What I used AI for**

- Diagnosing failing health checks and startup issues
- Understanding MongoDB startup logs and container behavior

**Why**
Docker health checks and startup timing are environment-dependent and sometimes subtle, and AI helped as a debugging aid.

**Example prompts**

- “Why would a Docker health check using wget return 400 for a NestJS app?”
- “Explain why MongoDB logs show frequent connections in Docker”

**Overrides and validation**
Initial suggestions that removed health checks were rejected. Instead, health endpoints and configurations were corrected to match actual routes and responses, and fixes were validated by inspecting logs and container health.

## 3. README & documentation drafting

**What I used AI for**

- Drafting README structure and section ideas
- Ensuring documentation covered setup, architecture, and ethics

**Why**
Documentation is important, and AI provided a useful checklist and starting structure.

**Validation**
All documentation was rewritten and adapted to reflect the actual implementation. Setup steps were tested on a clean environment.

## Where AI was NOT used

AI was intentionally not used for:

- Authentication flow design
- API route structure and access control
- Database schema decisions
- Frontend state management and routing logic
- Test coverage decisions
- Error handling and edge-case behaviour

These areas were designed and implemented manually to ensure correctness and intent.

## How AI output was validated

Every AI-assisted contribution was validated by at least one of:

- Manual code review and refactoring
- Running the application locally or in Docker
- Writing or executing tests
- Inspecting runtime logs and API responses

No AI-generated code was accepted without review.
