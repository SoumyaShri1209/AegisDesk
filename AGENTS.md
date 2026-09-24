# AGENTS.md

Guidance for AI coding agents working on this project.

## Project

**AegisDesk** — a multi-tenant Internal Service Agent platform.
Any company signs up, adds its own policies, and lets an LLM agent
resolve or route employee requests strictly using those policies.

## Stack

- Next.js (App Router, **JavaScript only** — no TypeScript)
- Tailwind CSS
- Framer Motion (animations)
- Lucide React (icons)
- Prisma + PostgreSQL (later stage)
- NextAuth (later stage)
- LLM provider via `lib/llm/` (later stage)

## Conventions

- **No hardcoded URLs.** Always use relative paths (`/login`, `/admin/dashboard`).
  Base URLs come from `process.env.NEXTAUTH_URL` only where required.
- **No TypeScript.** All files are `.jsx` / `.js`.
- Use **App Router** (`app/` folder). No `pages/`.
- Server components by default. Add `"use client"` only when needed
  (hooks, Framer Motion, event handlers).
- Use the `@/*` import alias (points to project root).
- Every route group uses layout files:
  - `app/(public)/` — landing, login, signup
  - `app/(user)/` — employee
  - `app/(dept)/` — IT / Security / Finance / Manager
  - `app/(admin)/` — company admin
- Styling: Tailwind utility classes only. Prefer classes defined in `globals.css`:
  - `.card`, `.glow-bg`, `.text-gradient`
- Use custom animations from `tailwind.config.js`:
  - `animate-fade-up`, `animate-fade-in`, `animate-float`, `animate-gradient-x`
- Responsive-first: mobile → tablet → desktop.
- Dark theme by default (base colors defined in `globals.css`).

## Next.js best practices

- Prefer Server Components. Fetch data on the server when possible.
- Use `next/link` for internal navigation — never `<a>` for app routes.
- Use `next/image` for all images.
- API routes live in `app/api/**/route.js` and export `GET`, `POST`, etc.
- Use route groups `(...)` for layout separation, not for URL segments.
- Metadata via `export const metadata` in `layout.jsx` / `page.jsx`.

## Do not

- Do not add TypeScript files.
- Do not hardcode domains, ports, or absolute URLs in code.
- Do not use the legacy `pages/` router.
- Do not install heavy UI libraries (Material UI, AntD, Chakra) — stick to Tailwind.
- Do not invent policies in the agent — always read from the company's policy store.

## Stages

The project is built in stages:
1. Setup + Landing + Theme
2. Auth + Signup + Login (all roles)
3. Prisma + PostgreSQL + Company & User models
4. Admin: Policies CRUD
5. LLM Layer: RAG + Agent decision engine
6. Employee: Chat + Requests
7. Tickets + SLA + Escalation
8. Department dashboards
9. Audit + Analytics + Deploy