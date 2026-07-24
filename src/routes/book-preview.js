const express = require("express");
const { validate } = require("../validate");
const { sendMail, notifyAddress } = require("../mailer");
const { bookPreviewTeamMail, bookPreviewUserMail } = require("../templates");
const { rateLimit } = require("../rateLimit");

const router = express.Router();

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
