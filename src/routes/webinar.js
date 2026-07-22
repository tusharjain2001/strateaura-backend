const express = require("express");
const { validate } = require("../validate");
const { sendMail, notifyAddress } = require("../mailer");
const { webinarTeamMail, webinarUserMail } = require("../templates");
const { rateLimit } = require("../rateLimit");

const router = express.Router();

const SPEC = {
  firstName: { required: true, max: 80, label: "First name" },
  lastName: { required: true, max: 80, label: "Last name" },
  email: { required: true, email: true, max: 160, label: "Email" },
  phone: { max: 40, label: "Phone" },
  webinar: { required: true, max: 160, label: "Webinar" },
  message: { max: 2000, label: "Message" },
};

router.post("/register", rateLimit({ max: 5 }), async (req, res, next) => {
  // Honeypot: a real person never sees or fills this field.
  if (req.body?.company) return res.json({ success: true });

  const { values, errors, valid } = validate(req.body, SPEC);
  if (!valid) {
    return res.status(400).json({ success: false, errors });
  }
  values.consent = Boolean(req.body?.consent);

  try {
    // The team notification is the one that must not be lost, so it decides the
    // response. A failed confirmation is logged but never costs us the lead.
    await sendMail({
      to: notifyAddress(),
      replyTo: values.email,
      subject: `New webinar registration — ${values.firstName} ${values.lastName}`,
      html: webinarTeamMail(values),
    });
  } catch (error) {
    return next(error);
  }

  try {
    await sendMail({
      to: values.email,
      subject: "You are on the list! — StrateAura Webinar",
      html: webinarUserMail(values),
    });
  } catch (error) {
    console.error("[webinar] confirmation email failed:", error.message);
  }

  res.json({ success: true });
});

module.exports = router;
