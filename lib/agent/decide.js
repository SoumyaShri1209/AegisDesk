import { generateJSON } from "../llm/client";

const AGENT_SCHEMA = {
  type: "object",
  properties: {
    action: {
      type: "string",
      enum: ["answer", "clarify", "escalate"],
      description:
        "answer = policies cover it OR it's a status/SLA question; clarify = too vague; escalate = new request OR policy steps already failed",
    },
    answer: {
      type: "string",
      description: "Markdown reply. Only fill when action = 'answer'.",
    },
    questions: {
      type: "array",
      items: { type: "string" },
      description: "Clarifying questions. Only fill when action = 'clarify'.",
    },
    ticket: {
      type: "object",
      properties: {
        department: {
          type: "string",
          enum: ["it", "security", "finance", "manager"],
        },
        priority: {
          type: "string",
          enum: ["low", "medium", "high", "critical"],
        },
        title: { type: "string" },
        reason: { type: "string" },
      },
      required: ["department", "priority", "title", "reason"],
      description: "Ticket draft. Only fill when action = 'escalate'.",
    },
    citations: {
      type: "array",
      items: { type: "string" },
      description: "Policy codes cited in the answer.",
    },
  },
  required: ["action"],
};

const SYSTEM_INSTRUCTION = `You are AegisDesk, an internal policy assistant.

You receive:
1. The employee's open tickets (if any)
2. Company policy excerpts
3. The employee's latest message
4. The conversation history

## Decide ONE of three actions

1. "answer"
   - The policies clearly cover the question, AND the employee has not already tried the suggested steps.
   - The question is about an existing ticket (status, SLA, timing).
   - Reply using the policy, cite the code, keep it short.

2. "clarify"
   - The question is too vague to decide.

3. "escalate"
   - The question is a new request that no policy covers, OR
   - The employee tried the policy's recommended steps and they FAILED, OR
   - The employee is blocked and needs human help.
   Create a ticket draft for the correct department.

## CRITICAL RULE about failed policy steps

If a policy says "do X" and the employee replies that X didn't work, you MUST escalate.
Do NOT repeat the same policy answer. Do NOT tell the employee to "try again".
The policy steps have already failed — a human needs to intervene.

Example:
- Employee: "How do I reset my password?"
  → answer: "Use the self-service portal. [K-01]"
- Employee: "I used the portal but it didn't work."
  → escalate to IT with reason "Password reset via self-service portal failed, employee is locked out."

## Hard rules about tickets

- NEVER create a ticket if the employee is asking about an existing ticket's status or timing.
- NEVER create a second ticket for the same underlying problem.
- NEVER invent details not present in the policy (no fake email addresses, form names, or steps).
- If a policy does not actually describe how to do something, escalate rather than guess.

## Tone

Friendly coworker, plain English, short sentences. Preserve the policy's meaning.

## Formatting

- One-line **summary**.
- Bullets ("-") for lists and steps.
- **Bold** key terms.
- "**Heads up:**" line for warnings.
- Under 120 words.`;

export async function decide({ question, history = [], chunks, openTickets = [] }) {
  const policyContext = chunks.length
    ? chunks
        .map((c, i) => {
          const code = c.policyCode ? `[${c.policyCode}] ` : "";
          return `--- Chunk ${i + 1} ---\n${code}${c.policyTitle}\n${c.content}`;
        })
        .join("\n\n")
    : "No relevant policies found.";

  const ticketContext = openTickets.length
    ? openTickets.map(formatTicketLine).join("\n")
    : "(none)";

  const historyBlock = history.length
    ? history
        .map((m) => `${m.role === "user" ? "Employee" : "Agent"}: ${m.content}`)
        .join("\n")
    : "(no prior messages)";

  const prompt = `## Conversation so far
${historyBlock}

## Employee's latest message
${question}

## Employee's open tickets
${ticketContext}

## Company policy excerpts
${policyContext}

Decide the next action.`;

  const result = await generateJSON({
    systemInstruction: SYSTEM_INSTRUCTION,
    prompt,
    schema: AGENT_SCHEMA,
  });

  if (!["answer", "clarify", "escalate"].includes(result.action)) {
    result.action = "escalate";
  }

  return result;
}

function formatTicketLine(t) {
  const remaining = formatRemaining(t.slaDueAt);
  const status = (t.status || "open").replace(/_/g, " ");
  return `- T-${t.number} · ${t.department.toUpperCase()} · priority: ${t.priority} · status: ${status} · SLA: ${remaining} · "${t.title}"`;
}

function formatRemaining(slaDueAt) {
  const diff = new Date(slaDueAt).getTime() - Date.now();
  if (diff < 0) {
    const overdue = -diff;
    return `OVERDUE by ${humanize(overdue)}`;
  }
  return `${humanize(diff)} remaining`;
}

function humanize(ms) {
  const min = Math.floor(ms / 60000);
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h >= 24) {
    const d = Math.floor(h / 24);
    return `${d}d ${h % 24}h`;
  }
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}