const express = require("express");
const { validate } = require("../validate");
const { sendMail, notifyAddress } = require("../mailer");
const { contactTeamMail, contactUserMail } = require("../templates");
const { rateLimit } = require("../rateLimit");

const router = express.Router();

const SPEC = {
  firstName: { required: true, max: 80, label: "First name" },
  lastName: { required: true, max: 80, label: "Last name" },
  email: { required: true, email: true, max: 160, label: "Email" },
  interest: { required: true, max: 300, label: "What are you looking for" },
  message: { max: 2000, label: "Message" },
};

router.post("/", rateLimit({ max: 5 }), async (req, res, next) => {
  // Honeypot: a real person never sees or fills this field. It must NOT be
  // named after an autofill token (company, organization, address...) or the
  // browser fills it for real visitors and every submission is dropped here.
  if (req.body?.hpField) {
    console.warn("[contact] honeypot tripped — submission dropped");
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
      subject: `New contact enquiry — ${values.firstName} ${values.lastName}`,
      html: contactTeamMail(values),
    });
  } catch (error) {
    return next(error);
  }

  try {
    await sendMail({
      to: values.email,
      subject: "Thank you for reaching out — StrateAura",
      html: contactUserMail(values),
    });
  } catch (error) {
    console.error("[contact] confirmation email failed:", error.message);
  }

  res.json({ success: true });
});

module.exports = router;
