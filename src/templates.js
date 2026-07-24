const { escapeHtml } = require("./validate");

// Site palette, so the mails look like the rest of StrateAura.
const GOLD = "#b3902f";
const NAVY = "#233a58";
const INK = "#4b5563";
const SITE = process.env.SITE_URL || "https://strateaura.com";

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

function brochureUserMail(v) {
  return shell(
    "Your brochure is here",
    paragraph(`Hi ${escapeHtml(v.fullName)},`) +
      paragraph(
        "Thank you for your interest in StrateAura. Your brochure is attached to this email — if you don't see the attachment, you can also download it with the button below."
      ) +
      (v.program
        ? paragraph(`You requested the brochure for: <strong style="color:${NAVY}">${escapeHtml(v.program)}</strong>`)
        : "") +
      button("Download Brochure", brochureUrl()) +
      paragraph(
        `<br />Warmly,<br /><strong style="color:${NAVY}">Dr. Suhair Hamouri</strong><br />StrateAura™`
      )
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
 * Figma 1816:1799 — the "Your Preview Chapter is Ready!" email the visitor
 * receives, with a gold "Download Preview Chapter" pill linking to the PDF.
 * Bespoke markup (not the generic shell) so it matches the design: a soft
 * gold→white gradient card, right-aligned wordmark, no gold header bar.
 */
function bookPreviewUserMail(v) {
  const name = escapeHtml(v.fullName || "there");
  const url = previewChapterUrl();
  const CREAM = "#fff9e8";
  const BODY = "#3d3b36";
  const MUTED = "#807c71";
  return `
  <div style="margin:0;padding:24px;background:#f4f1ea;font-family:Helvetica,Arial,sans-serif">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:600px;margin:0 auto;background:#fdeecb;background:linear-gradient(180deg,#fdeecb 0%,#ffffff 55%);border-radius:16px;border:1px solid #f2e6c4">
      <tr>
        <td style="padding:28px 40px 0;text-align:right">
          <div style="color:${GOLD};font-size:20px;font-weight:bold;letter-spacing:1px">STRATEAURA</div>
          <div style="color:${GOLD};opacity:.75;font-size:9px;letter-spacing:1.5px">PRESENCE BY DESIGN. POWER BY DEFAULT</div>
        </td>
      </tr>
      <tr>
        <td style="padding:22px 40px 8px">
          <p style="margin:0 0 22px;color:${GOLD};font-size:20px;font-weight:bold;line-height:1.2">Your Preview Chapter is Ready!</p>
          <p style="margin:0 0 14px;color:${BODY};font-size:16px;line-height:1.5">Hi ${name},</p>
          <p style="margin:0 0 24px;color:${BODY};font-size:16px;line-height:1.5">Thank you for your interest in StrateAura and for requesting a preview of our upcoming book. We're excited to share a complimentary preview chapter with you. We hope it gives you a glimpse into the ideas, insights, and perspectives explored throughout the book.</p>
          <p style="margin:0 0 18px;color:${MUTED};font-size:16px;line-height:1.5">Your preview chapter is attached to this email — you can also access it any time with the button below.</p>
          <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
            <td style="border-radius:100px;background:${GOLD}">
              <a href="${url}" target="_blank" style="display:inline-block;padding:10px 12px 10px 20px;color:${CREAM};font-size:16px;font-weight:bold;text-decoration:none;white-space:nowrap">Download Preview Chapter<span style="display:inline-block;width:24px;height:24px;line-height:24px;text-align:center;border-radius:50%;background:${CREAM};color:${GOLD};font-size:13px;vertical-align:middle;margin-left:10px">&#10022;</span></a>
            </td>
          </tr></table>
          <p style="margin:28px 0 0;color:${BODY};font-size:16px;line-height:1.6">Happy reading!</p>
          <p style="margin:22px 0 0;color:${BODY};font-size:16px;line-height:1.6">Warm regards,<br /><strong>The StrateAura Team</strong></p>
        </td>
      </tr>
      <tr>
        <td style="padding:24px 40px 28px;color:#a9a290;font-size:11px;line-height:1.6">
          StrateAura Management Development Training LLC · Iris Bay 2205-D90, Business Bay, Dubai, U.A.E<br />
          <a href="${SITE}" style="color:${GOLD};text-decoration:none">${escapeHtml(SITE.replace(/^https?:\/\//, ""))}</a>
        </td>
      </tr>
    </table>
  </div>`;
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
