require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { verifyTransport } = require("./src/mailer");
const webinarRoutes = require("./src/routes/webinar");
const contactRoutes = require("./src/routes/contact");

const app = express();

// Only the site may call these endpoints. ALLOWED_ORIGINS is a comma-separated
// list; leaving it unset allows any origin, which is fine locally but should
// always be set in production.
const allowed = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // No Origin header = curl / server-to-server, which CORS doesn't govern.
      if (!origin || allowed.length === 0 || allowed.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error(`Origin ${origin} is not allowed`));
    },
  })
);
app.use(express.json({ limit: "100kb" }));

app.get("/api/health", async (_req, res) => {
  try {
    await verifyTransport();
    res.json({ status: "ok", smtp: "connected" });
  } catch (error) {
    res.status(503).json({ status: "degraded", smtp: error.message });
  }
});

app.use("/api/webinar", webinarRoutes);
app.use("/api/contact", contactRoutes);

app.use((_req, res) => {
  res.status(404).json({ success: false, error: "Not found" });
});

// Mail/CORS failures land here. The real reason is logged for us; the caller
// gets a generic message so SMTP details never leak to the browser.
app.use((error, _req, res, _next) => {
  console.error("[error]", error);
  res.status(500).json({
    success: false,
    error: "We could not send your submission just now. Please try again.",
  });
});

// Vercel imports the app; running it directly starts a local server.
if (require.main === module) {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => console.log(`StrateAura backend listening on :${PORT}`));
}

module.exports = app;
