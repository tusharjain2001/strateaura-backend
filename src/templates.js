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
// The <style> block only carries the mobile media query — everything else is
// inline because Gmail and Outlook strip most embedded CSS.
function emailDocument(title, bodyHtml) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<meta name="color-scheme" content="light" />
<meta name="supported-color-schemes" content="light" />
<title>${escapeHtml(title)}</title>
<style>
  @media only screen and (max-width: 480px) {
    .sa-px { padding-left: 24px !important; padding-right: 24px !important; }
    .sa-logo { padding-right: 24px !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;background:#f4f1ea">${bodyHtml}</body>
</html>`;
}

/**
 * Shared card for the brochure (Figma 1816:2226) and book-preview (1816:1799)
 * confirmation mails — the two designs are the same 650px rounded card with a
 * #ffdf85→white 30% gradient (flattened over the white card: #fff5da→#ffffff,
 * pixel-sampled from the Figma render), differing only in content.
 *
 * Hybrid build: the gold pieces (wordmark, heading, button pill) are 4x Figma
 * PNG exports served from /email-assets — they carry the real Acumin Pro
 * typography and iOS Mail can't wash out their colour — while body copy stays
 * live text, which keeps the mail from being all-image (a spam signal) and
 * readable before images load. Body text uses the exact Figma geometry: content
 * column x=59/width=535 (right gutter 56), logo 177px at top 33/right 37,
 * heading at y=113, 16px/19px type (Acumin's "normal" leading ≈1.19 — NOT 1.5),
 * gaps 29/24/18/24, bottom padding 64 → the Figma card's 553px total.
 * `?v=2` on the images busts the 30-day immutable cache from the v1 assets.
 */
function figmaCardMail({ title, headingImg, headingW, bodyHtml, mutedLine, buttonImg, buttonW, buttonAlt, url, closingHtml }) {
  const BODY = "#3d3b36";
  const MUTED = "#807c71";
  const font = "font-family:Helvetica,Arial,sans-serif";
  const text = `font-size:16px;line-height:19px;${font}`;
  return emailDocument(
    title,
    `
  <div style="margin:0;padding:24px;background:#f4f1ea;${font}">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="650" align="center" style="width:100%;max-width:650px;margin:0 auto;border-collapse:collapse;border-radius:16px;background-color:#fff9ec;background-image:linear-gradient(180deg,#fff5da 0%,#ffffff 100%)">
      <tr><td class="sa-logo" style="padding:33px 37px 0 0;text-align:right;font-size:0;line-height:0">
        <img src="${ASSET_BASE}/preview-logo.png?v=2" alt="StrateAura — Presence by design. Power by default." width="177" style="display:inline-block;width:177px;max-width:60%;height:auto;border:0" />
      </td></tr>
      <tr><td class="sa-px" style="padding:51px 56px 0 59px">
        <img src="${ASSET_BASE}/${headingImg}?v=2" alt="${escapeHtml(title)}" width="${headingW}" style="display:block;width:${headingW}px;max-width:100%;height:auto;border:0" />
      </td></tr>
      <tr><td class="sa-px" style="padding:29px 56px 0 59px;color:${BODY};${text}">${bodyHtml}</td></tr>
      <tr><td class="sa-px" style="padding:24px 56px 0 59px;color:${MUTED};${text}">${mutedLine}</td></tr>
      <tr><td class="sa-px" style="padding:18px 56px 0 59px;font-size:0;line-height:0">
        <a href="${url}" target="_blank" style="display:inline-block;text-decoration:none">
          <img src="${ASSET_BASE}/${buttonImg}?v=2" alt="${escapeHtml(buttonAlt)}" width="${buttonW}" style="display:block;width:${buttonW}px;max-width:100%;height:auto;border:0" />
        </a>
      </td></tr>
      <tr><td class="sa-px" style="padding:24px 56px 64px 59px;color:${BODY};${text}">${closingHtml}</td></tr>
    </table>
  </div>`
  );
}

/** Figma 1816:2226 — "Your StrateAura Brochure is Ready!". `v` is unused. */
function brochureUserMail() {
  return figmaCardMail({
    title: "Your StrateAura Brochure is Ready!",
    headingImg: "brochure-heading.png",
    headingW: 320,
    bodyHtml:
      "Thank you for requesting the StrateAura brochure.<br /><br />We're pleased to share it with you. Inside, you'll find an overview of our offerings, approach, and the value we bring to our clients.",
    mutedLine: "Click the button below to download your brochure.",
    buttonImg: "brochure-button-pill.png",
    buttonW: 200,
    buttonAlt: "Download Brochure",
    url: brochureUrl(),
    closingHtml:
      "If you have any questions or would like to learn more, feel free to reply to this email, we'd be happy to help.<br /><br /><br />Best regards,<br /><strong>The StrateAura Team</strong>",
  });
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

/** Figma 1816:1799 — "Your Preview Chapter is Ready!", greets by name. */
function bookPreviewUserMail(v) {
  const name = escapeHtml(v.fullName || "there");
  return figmaCardMail({
    title: "Your Preview Chapter is Ready!",
    headingImg: "preview-heading.png",
    headingW: 285,
    bodyHtml: `Hi ${name},<br /><br />Thank you for your interest in StrateAura and for requesting a preview of our upcoming book. We're excited to share a complimentary preview chapter with you. We hope it gives you a glimpse into the ideas, insights, and perspectives explored throughout the book.`,
    mutedLine: "Click the button below to access your preview chapter.",
    buttonImg: "preview-button.png",
    buttonW: 253,
    buttonAlt: "Download Preview Chapter",
    url: previewChapterUrl(),
    closingHtml:
      "Happy reading!<br /><br /><br />Warm regards,<br /><strong>The StrateAura Team</strong>",
  });
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
