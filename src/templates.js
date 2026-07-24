const { escapeHtml } = require("./validate");

// Site palette, so the mails look like the rest of StrateAura.
const GOLD = "#b3902f";
const NAVY = "#233a58";
const INK = "#4b5563";
const SITE = process.env.SITE_URL || "https://strateaura.com";

// Where the confirmation emails load their branded images from (wordmark,
// headings, button — rendered as PNGs so iOS Mail can't wash out the colours).
// Served by the backend's /email-assets static route; override per-env.
const ASSET_BASE =
  process.env.EMAIL_ASSET_BASE ||
  "https://strateaura-backend.vercel.app/email-assets";

function shell(title, bodyHtml) {
  return `
  <div style="margin:0;padding:24px;background:#f5f5f5;font-family:Helvetica,Arial,sans-serif">
    <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:8px;overflow:hidden">
      <div style="background:${GOLD};padding:20px 32px">
        <div style="color:#ffffff;font-size:20px;font-weight:bold;letter-spacing:.5px">STRATEAURA</div>
        <div style="color:#ffffff;opacity:.85;font-size:11px;letter-spacing:1px">PRESENCE BY DESIGN. POWER BY DEFAULT</div>
      </div>
      <div style="padding:32px">
        <h1 style="margin:0 0 16px;color:${NAVY};font-size:22px;line-height:1.3">${escapeHtml(title)}</h1>
        ${bodyHtml}
      </div>
      <div style="padding:20px 32px;background:#fbfbfb;border-top:1px solid #eeeeee;color:#8a8a8a;font-size:12px;line-height:1.6">
        StrateAura Management Development Training LLC<br />
        Iris Bay - 2205 - D90, Business Bay, Dubai, U.A.E<br />
        <a href="${SITE}" style="color:${GOLD}">${escapeHtml(SITE.replace(/^https?:\/\//, ""))}</a>
      </div>
    </div>
  </div>`;
}

function rows(pairs) {
  return `
  <table style="width:100%;border-collapse:collapse;font-size:15px;color:${INK}">
    ${pairs
      .filter(([, value]) => value)
      .map(
        ([label, value]) => `
      <tr>
        <td style="padding:10px 12px 10px 0;color:${NAVY};font-weight:bold;white-space:nowrap;vertical-align:top;border-bottom:1px solid #f0f0f0">${escapeHtml(label)}</td>
        <td style="padding:10px 0;vertical-align:top;border-bottom:1px solid #f0f0f0">${escapeHtml(value)}</td>
      </tr>`
      )
      .join("")}
  </table>`;
}

function paragraph(text) {
  return `<p style="margin:0 0 16px;color:${INK};font-size:15px;line-height:1.6">${text}</p>`;
}

function button(label, href) {
  return `
  <p style="margin:28px 0 0">
    <a href="${href}" style="display:inline-block;background:${NAVY};color:#ffffff;text-decoration:none;font-weight:bold;font-size:15px;padding:14px 28px;border-radius:100px">${escapeHtml(label)}</a>
  </p>`;
}

/* ---------------------------------------------------------------- webinar */

function webinarTeamMail(v) {
  return shell(
    "New webinar registration",
    rows([
      ["Name", `${v.firstName} ${v.lastName}`],
      ["Email", v.email],
      ["Phone", v.phone],
      ["Webinar", v.webinar],
      ["Message", v.message],
      ["Email updates", v.consent ? "Yes — opted in" : "No"],
      ["Submitted", new Date().toUTCString()],
    ])
  );
}

function webinarUserMail(v) {
  return shell(
    "You are on the list!",
    paragraph(`Hi ${escapeHtml(v.firstName)},`) +
      paragraph(
        "Thank you for reserving your spot. You will receive an email from us as soon as the next webinar date is confirmed — you will be among the first to know. We look forward to being in the room with you."
      ) +
      (v.webinar
        ? paragraph(`You registered for: <strong style="color:${NAVY}">${escapeHtml(v.webinar)}</strong>`)
        : "") +
      button("Explore more about VEIL™", `${SITE}/veil`) +
      paragraph(
        `<br />Warmly,<br /><strong style="color:${NAVY}">Dr. Suhair Hamouri</strong><br />StrateAura™`
      )
  );
}

/* ---------------------------------------------------------------- contact */

function contactTeamMail(v) {
  return shell(
    "New contact enquiry",
    rows([
      ["Name", `${v.firstName} ${v.lastName}`],
      ["Email", v.email],
      ["Looking for", v.interest],
      ["Message", v.message],
      ["Submitted", new Date().toUTCString()],
    ])
  );
}

function contactUserMail(v) {
  return shell(
    "Thank you for reaching out",
    paragraph(`Hi ${escapeHtml(v.firstName)},`) +
      paragraph(
        "Thank you for getting in touch with StrateAura. We have received your message and a member of our team will get back to you shortly."
      ) +
      (v.interest
        ? paragraph(`You told us you are looking for: <strong style="color:${NAVY}">${escapeHtml(v.interest)}</strong>`)
        : "") +
      button("Explore our programs", `${SITE}/programs`) +
      paragraph(
        `<br />Warmly,<br /><strong style="color:${NAVY}">Dr. Suhair Hamouri</strong><br />StrateAura™`
      )
  );
}

/* --------------------------------------------------------------- brochure */

function brochureTeamMail(v) {
  return shell(
    "New brochure request",
    rows([
      ["Name", v.fullName],
      ["Email", v.email],
      ["Brochure requested", v.program],
      ["Submitted", new Date().toUTCString()],
    ])
  );
}

// Public URL the brochure mail's download button points to. Defaults to the
// backend's own download route (which streams assets/<BROCHURE_FILE>);
// override with any hosted PDF URL via BROCHURE_URL.
function brochureUrl() {
  return (
    process.env.BROCHURE_URL ||
    "https://strateaura-backend.vercel.app/api/brochure/download"
  );
}

// Full-document wrapper so iOS Mail honours color-scheme (keeps the light card
// from being dark-mode-inverted) and images sit on a neutral page background.
function emailDocument(title, bodyHtml) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<meta name="color-scheme" content="light" />
<meta name="supported-color-schemes" content="light" />
<title>${escapeHtml(title)}</title>
</head>
<body style="margin:0;padding:0;background:#f4f1ea">${bodyHtml}</body>
</html>`;
}

// A full-bleed email image (used for the sliced brochure bands). Width is fixed
// at the card size but scales down on narrow phones via max-width:100%.
function bandImage(file, alt) {
  return `<img src="${ASSET_BASE}/${file}" alt="${escapeHtml(alt)}" width="650" style="display:block;width:100%;max-width:650px;height:auto;border:0;outline:none;text-decoration:none" />`;
}

/**
 * Figma 1816:2226 — the "Your StrateAura Brochure is Ready!" email. Fully
 * static (no personalisation), so every word is baked into three stacked PNG
 * bands: text → button → text. Rendering the text as images means iOS Mail
 * can't fade the gold/branded colours. Only the middle band is a link (wraps
 * the "Download Brochure" pill and points at the PDF); `v` is unused.
 */
function brochureUserMail(v) {
  const url = brochureUrl();
  return emailDocument(
    "Your StrateAura Brochure is Ready",
    `
  <div style="margin:0;padding:24px;background:#f4f1ea">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="650" align="center" style="max-width:650px;margin:0 auto;border-collapse:collapse">
      <tr><td style="font-size:0;line-height:0">${bandImage(
        "brochure-top.png",
        "Your StrateAura Brochure is Ready! Thank you for requesting the StrateAura brochure. We're pleased to share it with you. Inside, you'll find an overview of our offerings, approach, and the value we bring to our clients. Click the button below to download your brochure."
      )}</td></tr>
      <tr><td style="font-size:0;line-height:0"><a href="${url}" target="_blank" style="display:block;text-decoration:none">${bandImage(
        "brochure-button.png",
        "Download Brochure"
      )}</a></td></tr>
      <tr><td style="font-size:0;line-height:0">${bandImage(
        "brochure-bottom.png",
        "If you have any questions or would like to learn more, feel free to reply to this email, we'd be happy to help. Best regards, The StrateAura Team"
      )}</td></tr>
    </table>
  </div>`
  );
}

/* ---------------------------------------------------------- book preview */

function bookPreviewTeamMail(v) {
  return shell(
    "New book preview request",
    rows([
      ["Name", v.fullName],
      ["Email", v.email],
      ["Book", v.book],
      ["Submitted", new Date().toUTCString()],
    ])
  );
}

// Public URL the "Download Preview Chapter" button points to. Defaults to the
// backend's own download route (which streams assets/<PREVIEW_CHAPTER_FILE>);
// override with any hosted PDF URL via PREVIEW_CHAPTER_URL.
function previewChapterUrl() {
  return (
    process.env.PREVIEW_CHAPTER_URL ||
    "https://strateaura-backend.vercel.app/api/book-preview/download"
  );
}

/**
 * Figma 1816:1799 — the "Your Preview Chapter is Ready!" email. The visitor is
 * greeted by name, so the greeting/body paragraph stays as live text; the
 * fade-prone branded pieces (gold wordmark, gold heading, the gold pill button)
 * are baked into transparent PNGs served from /email-assets so iOS Mail can't
 * wash out their colour. They sit on the same soft cream→white gradient the
 * design uses, drawn here as a CSS gradient (with a solid cream fallback). Only
 * the button image is a link, pointing at the preview-chapter PDF.
 */
function bookPreviewUserMail(v) {
  const name = escapeHtml(v.fullName || "there");
  const url = previewChapterUrl();
  const BODY = "#3d3b36";
  const MUTED = "#8a8577";
  const font = "font-family:Helvetica,Arial,sans-serif";
  return emailDocument(
    "Your Preview Chapter is Ready",
    `
  <div style="margin:0;padding:24px;background:#f4f1ea;${font}">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="650" align="center" style="max-width:650px;margin:0 auto;border-collapse:collapse;border-radius:16px;background-color:#fff9ec;background-image:linear-gradient(180deg,#fff5da 0%,#ffffff 100%)">
      <tr><td style="padding:33px 54px 0;text-align:right">
        <img src="${ASSET_BASE}/preview-logo.png" alt="StrateAura — Presence by design. Power by default." width="177" style="display:inline-block;width:177px;max-width:60%;height:auto;border:0" />
      </td></tr>
      <tr><td style="padding:50px 54px 0">
        <img src="${ASSET_BASE}/preview-heading.png" alt="Your Preview Chapter is Ready!" width="285" style="display:block;width:285px;max-width:100%;height:auto;border:0" />
      </td></tr>
      <tr><td style="padding:28px 54px 0;color:${BODY};font-size:16px;line-height:1.55;${font}">
        Hi ${name},<br /><br />Thank you for your interest in StrateAura and for requesting a preview of our upcoming book. We're excited to share a complimentary preview chapter with you. We hope it gives you a glimpse into the ideas, insights, and perspectives explored throughout the book.
      </td></tr>
      <tr><td style="padding:24px 54px 0;color:${MUTED};font-size:16px;line-height:1.5;${font}">
        Click the button below to access your preview chapter.
      </td></tr>
      <tr><td style="padding:18px 54px 0">
        <a href="${url}" target="_blank" style="display:inline-block;text-decoration:none">
          <img src="${ASSET_BASE}/preview-button.png" alt="Download Preview Chapter" width="253" style="display:block;width:253px;max-width:100%;height:auto;border:0" />
        </a>
      </td></tr>
      <tr><td style="padding:26px 54px 48px;color:${BODY};font-size:16px;line-height:1.6;${font}">
        Happy reading!<br /><br />Warm regards,<br /><strong>The StrateAura Team</strong>
      </td></tr>
    </table>
  </div>`
  );
}

module.exports = {
  webinarTeamMail,
  webinarUserMail,
  contactTeamMail,
  contactUserMail,
  brochureTeamMail,
  brochureUserMail,
  bookPreviewTeamMail,
  bookPreviewUserMail,
};
