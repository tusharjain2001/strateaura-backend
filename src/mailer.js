const nodemailer = require("nodemailer");

/**
 * One shared transport. Two ways to configure it:
 *
 *   SMTP_SERVICE=gmail            → nodemailer's built-in preset (needs an
 *                                   App Password, not the account password)
 *   SMTP_HOST/SMTP_PORT/SMTP_SECURE → any other provider (Zoho, Titan,
 *                                   Google Workspace SMTP, Hostinger, ...)
 *
 * Both use SMTP_USER / SMTP_PASS for auth.
 */
function buildTransport() {
  const base = {
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  };

  if (process.env.SMTP_SERVICE) {
    return nodemailer.createTransport({ service: process.env.SMTP_SERVICE, ...base });
  }

  const port = Number(process.env.SMTP_PORT || 587);
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    // 465 is implicit TLS; 587 upgrades via STARTTLS.
    secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === "true" : port === 465,
    ...base,
  });
}

const transport = buildTransport();

/** Address every outbound mail is sent from, e.g. training@strateaura.com. */
function fromAddress() {
  const name = process.env.MAIL_FROM_NAME || "StrateAura";
  const address = process.env.MAIL_FROM_ADDRESS || process.env.SMTP_USER;
  return `"${name}" <${address}>`;
}

/** Internal inbox that receives the form submissions. */
function notifyAddress() {
  return process.env.NOTIFY_EMAIL || process.env.MAIL_FROM_ADDRESS || process.env.SMTP_USER;
}

async function sendMail({ to, subject, html, replyTo, attachments }) {
  const info = await transport.sendMail({ from: fromAddress(), to, subject, html, replyTo, attachments });
  // Logged so the Vercel logs show what the SMTP server actually accepted —
  // "the API returned success" is not on its own evidence that mail was sent.
  console.log(`[mail] to=${to} accepted=${info.accepted?.join(",") || "none"} id=${info.messageId}`);
  return info;
}

/** Proves the SMTP credentials work — used by /api/health and the dev script. */
async function verifyTransport() {
  await transport.verify();
}

module.exports = { sendMail, verifyTransport, fromAddress, notifyAddress };
