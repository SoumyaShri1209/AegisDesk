# AegisDesk

An AI-powered internal service desk that answers employee questions using company policies (RAG) and automatically creates department tickets (Agentic AI) when policies don't cover the request.

## Features

- **Agentic RAG** — retrieves relevant policies, then decides to **answer**, **clarify**, or **escalate**
- **Auto ticketing** — escalations create real tickets with sequential IDs (`T-1001`), priority, and SLA deadlines
- **Role-based access** — Admin · Employee · IT · Security · Finance · Manager
- **Multi-tenant** — every query is scoped by `companyId` (strict isolation)
- **Policy management** — admin uploads PDFs, they're chunked, embedded, and searchable
- **SLA tracking** — automatic breach detection and escalation
- **Audit log** — every action recorded (who, what, when)
- **Analytics** — SLA compliance %, ticket volume, per-department breakdown
- **Chat history** — persists across sessions per employee

## Tech Stack

- **Next.js 16** (App Router) + React 19
- **Tailwind CSS 4** + Framer Motion
- **NextAuth** (credentials, JWT sessions)
- **Prisma 7** + **PostgreSQL** (Supabase) + **pgvector**
- **Google Gemini** — `gemini-3.5-flash-lite` (chat), `gemini-embedding-001` (embeddings)
- **Vercel** for deployment

## Architecture

```
Employee asks question
        │
        ▼
   POST /api/chat
        │
        ├─ Embed question (Gemini)
        ├─ Retrieve top-5 policy chunks (pgvector, company-scoped)
        └─ Send to LLM with history + open tickets
                │
                ▼
        Agent decides one action:
        ┌──────────┬──────────┬──────────┐
        │  answer  │ clarify  │ escalate │
        └──────────┴──────────┴──────────┘
             │          │          │
        Reply with   Ask 1–3   Create ticket
        citations    follow-ups (dept + priority + SLA)
                                  │
                                  ▼
                          Department queue
                          → reply / resolve
                          → resolution posted to chat
```

**Flow:** RAG retrieves the right policies → the agent decides whether to answer, ask for clarification, or escalate → escalations become real tickets routed to IT / Security / Finance / Manager with SLA deadlines.
