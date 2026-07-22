/**
 * Sanity check before wiring the site up:
 *   npm run check-mail -- you@example.com
 *
 * Verifies the SMTP credentials, then sends one of each real template so you
 * can see exactly what the team and the registrant receive.
 */
require("dotenv").config();
const { sendMail, verifyTransport, fromAddress, notifyAddress } = require("../src/mailer");
const { webinarTeamMail, webinarUserMail, contactTeamMail, contactUserMail } = require("../src/templates");

const to = process.argv[2] || process.env.NOTIFY_EMAIL;

const sample = {
  firstName: "Test",
  lastName: "Registrant",
  email: to,
  phone: "+971 50 000 0000",
  webinar: "Learn about the topic",
  interest: "Leadership training for our team",
  message: "This is a test submission.",
  consent: true,
};

(async () => {
  if (!to) {
    console.error("Pass a recipient: npm run check-mail -- you@example.com");
    process.exit(1);
  }

  console.log(`From:   ${fromAddress()}`);
  console.log(`Notify: ${notifyAddress()}`);
  console.log(`Test to: ${to}\n`);

  try {
    await verifyTransport();
    console.log("SMTP credentials OK");
  } catch (error) {
    console.error("SMTP verify failed:", error.message);
    process.exit(1);
  }

  const mails = [
    ["webinar / team", webinarTeamMail(sample)],
    ["webinar / registrant", webinarUserMail(sample)],
    ["contact / team", contactTeamMail(sample)],
    ["contact / enquirer", contactUserMail(sample)],
  ];

  for (const [label, html] of mails) {
    await sendMail({ to, subject: `[TEST] ${label}`, html });
    console.log(`sent: ${label}`);
  }

  console.log("\nAll four templates sent.");
})();
