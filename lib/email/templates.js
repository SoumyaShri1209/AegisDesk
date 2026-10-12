const BASE_STYLE = `
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  background: #0b1020;
  color: #e8ecff;
  padding: 32px 16px;
`;

const CARD_STYLE = `
  max-width: 560px;
  margin: 0 auto;
  background: #121933;
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 16px;
  padding: 28px;
`;

const BTN_STYLE = `
  display: inline-block;
  background: #3a63ff;
  color: #ffffff;
  padding: 10px 18px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 500;
  margin-top: 16px;
`;

function layout(title, bodyHtml) {
  return `
    <div style="${BASE_STYLE}">
      <div style="${CARD_STYLE}">
        <div style="font-size: 12px; color: #8b93b8; letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 8px;">AegisDesk</div>
        <h1 style="margin: 0 0 16px 0; font-size: 20px; color: #e8ecff;">${title}</h1>
        ${bodyHtml}
        <p style="margin-top: 28px; font-size: 12px; color: #8b93b8;">
          You're receiving this because you're part of an AegisDesk workspace.
        </p>
      </div>
    </div>
  `;
}

const DEPT_LABEL = {
  it: "IT",
  security: "Security",
  finance: "Finance",
  manager: "Management",
};

const SLA_LABEL = {
  critical: "2 hours",
  high: "8 hours",
  medium: "24 hours",
  low: "3 days",
};

export function ticketCreatedForEmployee({ ticket, employee }) {
  const dept = DEPT_LABEL[ticket.department] || ticket.department;
  const sla = SLA_LABEL[ticket.priority] || "a few days";

  const body = `
    <p style="margin: 0 0 12px 0; line-height: 1.6;">Hi ${employee.name},</p>
    <p style="margin: 0 0 12px 0; line-height: 1.6;">
      Your request has been received and routed to the <strong>${dept}</strong> team.
    </p>
    <div style="background: rgba(255,255,255,0.04); border-radius: 10px; padding: 16px; margin: 16px 0;">
      <div style="font-size: 12px; color: #8b93b8; margin-bottom: 6px;">Ticket T-${ticket.number}</div>
      <div style="font-size: 15px; font-weight: 600; margin-bottom: 6px;">${ticket.title}</div>
      <div style="font-size: 13px; color: #8b93b8;">Priority: ${ticket.priority} · Expected response: within ${sla}</div>
    </div>
    <p style="margin: 0 0 0 0; line-height: 1.6; color: #8b93b8; font-size: 13px;">
      You can track the status anytime in your AegisDesk dashboard.
    </p>
  `;

  return {
    subject: `Ticket T-${ticket.number} received — ${dept} will respond soon`,
    html: layout("We've got your request", body),
  };
}

export function ticketCreatedForDept({ ticket, user }) {
  const dept = DEPT_LABEL[ticket.department] || ticket.department;
  const sla = SLA_LABEL[ticket.priority] || "a few days";

  const body = `
    <p style="margin: 0 0 12px 0; line-height: 1.6;">Hi ${user.name},</p>
    <p style="margin: 0 0 12px 0; line-height: 1.6;">
      A new ticket has been routed to the <strong>${dept}</strong> queue.
    </p>
    <div style="background: rgba(255,255,255,0.04); border-radius: 10px; padding: 16px; margin: 16px 0;">
      <div style="font-size: 12px; color: #8b93b8; margin-bottom: 6px;">Ticket T-${ticket.number}</div>
      <div style="font-size: 15px; font-weight: 600; margin-bottom: 6px;">${ticket.title}</div>
      <div style="font-size: 13px; color: #8b93b8; margin-bottom: 8px;">${ticket.reason}</div>
      <div style="font-size: 13px; color: #8b93b8;">Priority: ${ticket.priority} · SLA: ${sla}</div>
    </div>
  `;

  return {
    subject: `[${dept}] New ticket T-${ticket.number}: ${ticket.title}`,
    html: layout("New ticket in your queue", body),
  };
}

export function ticketReplyForEmployee({ ticket, reply, author }) {
  const body = `
    <p style="margin: 0 0 12px 0; line-height: 1.6;">Someone from the ${ticket.department.toUpperCase()} team replied to your ticket.</p>
    <div style="background: rgba(255,255,255,0.04); border-radius: 10px; padding: 16px; margin: 16px 0;">
      <div style="font-size: 12px; color: #8b93b8; margin-bottom: 6px;">
        T-${ticket.number} · ${author.name}
      </div>
      <div style="font-size: 14px; line-height: 1.6; white-space: pre-line;">${escapeHtml(reply.body)}</div>
    </div>
    <p style="margin: 0; line-height: 1.6; color: #8b93b8; font-size: 13px;">
      You can reply directly from your AegisDesk chat.
    </p>
  `;

  return {
    subject: `Reply on T-${ticket.number} — ${ticket.title}`,
    html: layout("New reply on your ticket", body),
  };
}

export function ticketResolvedForEmployee({ ticket, resolution }) {
  const body = `
    <p style="margin: 0 0 12px 0; line-height: 1.6;">
      Good news — your ticket has been resolved by the ${ticket.department.toUpperCase()} team.
    </p>
    <div style="background: rgba(34,197,94,0.10); border: 1px solid rgba(34,197,94,0.25); border-radius: 10px; padding: 16px; margin: 16px 0;">
      <div style="font-size: 12px; color: #86efac; margin-bottom: 6px;">Ticket T-${ticket.number}</div>
      <div style="font-size: 14px; line-height: 1.6; white-space: pre-line;">${escapeHtml(resolution)}</div>
    </div>
    <p style="margin: 0; line-height: 1.6; color: #8b93b8; font-size: 13px;">
      If the issue comes back, you can reopen the ticket from your dashboard.
    </p>
  `;

  return {
    subject: `✅ Ticket T-${ticket.number} resolved`,
    html: layout("Your ticket is resolved", body),
  };
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}