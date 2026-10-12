import { BrevoClient } from "@getbrevo/brevo";

const apiKey = process.env.BREVO_API_KEY;
const senderEmail = process.env.BREVO_SENDER_EMAIL;
const senderName = process.env.BREVO_SENDER_NAME || "AegisDesk";

let brevo = null;

if (apiKey && senderEmail) {
  brevo = new BrevoClient({ apiKey });
} else {
  console.warn(
    "[email] BREVO_API_KEY or BREVO_SENDER_EMAIL not set — emails will be skipped"
  );
}

export async function sendEmail({ to, subject, html }) {
  if (!brevo) return { skipped: true };

  try {
    const result = await brevo.transactionalEmails.sendTransacEmail({
      subject,
      htmlContent: html,
      sender: { name: senderName, email: senderEmail },
      to: [{ email: to }],
    });
    console.log("[email] sent →", to, "|", subject);
    return result;
  } catch (err) {
    const msg = err?.message || "Unknown error";
    console.error("[email] failed →", to, "|", msg);
    return { error: msg };
  }
}