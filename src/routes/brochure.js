const express = require("express");
const { validate } = require("../validate");
const { sendMail, notifyAddress } = require("../mailer");
const { brochureTeamMail, brochureUserMail } = require("../templates");
const { rateLimit } = require("../rateLimit");

const router = express.Router();

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
  // team, so a failure here shouldn't fail the whole submission.
  try {
    await sendMail({
      to: values.email,
      subject: "Thanks for requesting the brochure — StrateAura",
      html: brochureUserMail(values),
    });
  } catch (error) {
    console.error("[brochure] confirmation email failed:", error.message);
  }

  res.json({ success: true });
});

module.exports = router;
