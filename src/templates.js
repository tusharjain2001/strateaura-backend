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

module.exports = {
  webinarTeamMail,
  webinarUserMail,
  contactTeamMail,
  contactUserMail,
};
