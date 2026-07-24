const express = require("express");
const path = require("path");
const fs = require("fs");
const { validate } = require("../validate");
const { sendMail, notifyAddress } = require("../mailer");
const { brochureTeamMail, brochureUserMail } = require("../templates");
const { rateLimit } = require("../rateLimit");

const router = express.Router();

// The brochure PDF lives in the backend's assets/ folder next to the preview
// chapter. (On Vercel, keep the vercel.json `includeFiles: "assets/**"` so it
// ships with the function.)
const ASSETS_DIR = path.join(__dirname, "..", "..", "assets");

// Finds the brochure PDF: an explicit BROCHURE_FILE wins, then the conventional
// veil-brochure.pdf, otherwise any .pdf in assets/ with "brochure" in its name.
function resolveBrochurePath() {
  if (process.env.BROCHURE_FILE) {
    const explicit = path.join(ASSETS_DIR, process.env.BROCHURE_FILE);
    if (fs.existsSync(explicit)) return explicit;
    // A stale env var (pointing at a renamed/removed file) shouldn't take the
    // route down when a usable PDF is sitting in assets/.
    console.warn(`[brochure] BROCHURE_FILE not found: ${explicit} — falling back`);
  }
  const preferred = path.join(ASSETS_DIR, "veil-brochure.pdf");
  if (fs.existsSync(preferred)) return preferred;
  try {
    const pdf = fs
      .readdirSync(ASSETS_DIR)
      .find((f) => f.toLowerCase().endsWith(".pdf") && f.toLowerCase().includes("brochure"));
    if (pdf) return path.join(ASSETS_DIR, pdf);
  } catch {
    /* assets/ missing — fall through to the 404 */
  }
  return preferred;
}

// Streams the brochure to the browser — the target of the email's "Download
// Brochure" button, and a fallback if a mail client strips the attachment.
// Served inline so it previews in the browser; add ?download=1 to force save-as.
router.get("/download", (req, res, next) => {
  const filePath = resolveBrochurePath();
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({
      success: false,
      error: "The brochure is not available yet. Please try again later.",
    });
  }
  const disposition = req.query.download ? "attachment" : "inline";
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `${disposition}; filename="StrateAura-VEIL-Brochure.pdf"`
  );
  res.sendFile(filePath, (error) => {
    if (error) next(error);
  });
});

const SPEC = {
  fullName: { required: true, max: 120, label: "Full name" },
  email: { required: true, email: true, max: 160, label: "Email" },
  // Which program/brochure the visitor asked for; the frontend passes this
  // from the section that opened the form (e.g. the VEIL™ flagship).
  program: { max: 200, label: "Program" },
};

router.post("/", rateLimit({ max: 5 }), async (req, res, next) => {
  // Honeypot: a real person never sees or fills this field.
  if (req.body?.hpField) {
    console.warn("[brochure] honeypot tripped — submission dropped");
    return res.json({ success: true });
  }

  const { values, errors, valid } = validate(req.body, SPEC);
  if (!valid) {
    return res.status(400).json({ success: false, errors });
  }

  try {
    await sendMail({
      to: notifyAddress(),
      replyTo: values.email,
      subject: `New brochure request — ${values.fullName}`,
      html: brochureTeamMail(values),
    });
  } catch (error) {
    return next(error);
  }

  // Confirmation to the visitor is best-effort: the request already reached the
  // team, so a failure here shouldn't fail the whole submission. The brochure
  // rides along as an attachment; if the PDF is somehow missing the mail still
  // goes out with just the download button.
  const brochurePath = resolveBrochurePath();
  const attachments = fs.existsSync(brochurePath)
    ? [{ filename: "StrateAura-VEIL-Brochure.pdf", path: brochurePath }]
    : [];
  if (!attachments.length) {
    console.error("[brochure] brochure PDF missing from assets/ — sending confirmation without attachment");
  }
  try {
    await sendMail({
      to: values.email,
      subject: "Your brochure is here — StrateAura",
      html: brochureUserMail(values),
      attachments,
    });
  } catch (error) {
    console.error("[brochure] confirmation email failed:", error.message);
  }

  res.json({ success: true });
});

module.exports = router;
