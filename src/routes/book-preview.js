const express = require("express");
const path = require("path");
const fs = require("fs");
const { validate } = require("../validate");
const { sendMail, notifyAddress } = require("../mailer");
const { bookPreviewTeamMail, bookPreviewUserMail } = require("../templates");
const { rateLimit } = require("../rateLimit");

const router = express.Router();

// The preview chapter PDF lives in the backend's assets/ folder — just drop the
// file in and it's served, no config needed. (On Vercel, keep the vercel.json
// `includeFiles: "assets/**"` so it ships with the function.)
const ASSETS_DIR = path.join(__dirname, "..", "..", "assets");

// Finds the PDF to serve: an explicit PREVIEW_CHAPTER_FILE wins, then the
// conventional preview-chapter.pdf, otherwise whatever single .pdf is in
// assets/ — so saving any PDF there "just works" without touching .env.
function resolveChapterPath() {
  if (process.env.PREVIEW_CHAPTER_FILE) {
    return path.join(ASSETS_DIR, process.env.PREVIEW_CHAPTER_FILE);
  }
  const preferred = path.join(ASSETS_DIR, "preview-chapter.pdf");
  if (fs.existsSync(preferred)) return preferred;
  try {
    const pdf = fs
      .readdirSync(ASSETS_DIR)
      .find((f) => f.toLowerCase().endsWith(".pdf"));
    if (pdf) return path.join(ASSETS_DIR, pdf);
  } catch {
    /* assets/ missing — fall through to the 404 */
  }
  return preferred;
}

// Streams the preview chapter to the browser. Served inline so it previews in
// the browser's PDF viewer (the reader can still download from there); add
// ?download=1 to force a save-as instead. This is the target of the email's
// "Download Preview Chapter" button.
router.get("/download", (req, res, next) => {
  const filePath = resolveChapterPath();
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({
      success: false,
      error: "The preview chapter is not available yet. Please try again later.",
    });
  }
  const disposition = req.query.download ? "attachment" : "inline";
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `${disposition}; filename="StrateAura-Preview-Chapter.pdf"`
  );
  res.sendFile(filePath, (error) => {
    if (error) next(error);
  });
});

const SPEC = {
  fullName: { required: true, max: 120, label: "Full name" },
  email: { required: true, email: true, max: 160, label: "Email" },
  // Which book the visitor asked a preview of; the frontend passes this.
  book: { max: 200, label: "Book" },
};

router.post("/", rateLimit({ max: 5 }), async (req, res, next) => {
  // Honeypot: a real person never sees or fills this field.
  if (req.body?.hpField) {
    console.warn("[book-preview] honeypot tripped — submission dropped");
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
      subject: `New book preview request — ${values.fullName}`,
      html: bookPreviewTeamMail(values),
    });
  } catch (error) {
    return next(error);
  }

  // Confirmation to the visitor is best-effort.
  try {
    await sendMail({
      to: values.email,
      subject: "Thanks for requesting the book — StrateAura",
      html: bookPreviewUserMail(values),
    });
  } catch (error) {
    console.error("[book-preview] confirmation email failed:", error.message);
  }

  res.json({ success: true });
});

module.exports = router;
