require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { verifyTransport } = require("./src/mailer");
const webinarRoutes = require("./src/routes/webinar");
const contactRoutes = require("./src/routes/contact");
const brochureRoutes = require("./src/routes/brochure");
const bookPreviewRoutes = require("./src/routes/book-preview");

const app = express();

// Origins are compared case-insensitively and without a trailing slash, since
// "https://site.com/" in an env var would otherwise never match the browser's
// "https://site.com".
const normalize = (origin) => String(origin).trim().toLowerCase().replace(/\/+$/, "");

const allowed = (process.env.ALLOWED_ORIGINS || "").split(",").map(normalize).filter(Boolean);

const LOCALHOST = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;
const VERCEL_APP = /^https:\/\/[a-z0-9-]+\.vercel\.app$/;

function isAllowed(origin) {
  const value = normalize(origin);
  // Unset = allow everything. Fine locally, but set it in production.
  if (allowed.length === 0) return true;
  if (allowed.includes(value)) return true;
  // Always permit local dev and Vercel deployments (each preview build gets its
  // own subdomain, so listing them by hand is impractical). These endpoints are
  // public forms guarded by a honeypot and a rate limit — CORS is not the
  // security boundary here, it only keeps other sites from posting as us.
  return LOCALHOST.test(value) || VERCEL_APP.test(value);
}

app.use(
  cors({
    origin(origin, callback) {
      // No Origin header = curl / server-to-server, which CORS doesn't govern.
      if (!origin || isAllowed(origin)) {
        callback(null, true);
        return;
      }
      // Refuse by omitting the header rather than throwing: throwing lands in
      // the error handler, and a 500 with no CORS headers tells the browser
      // nothing except "CORS error".
      console.warn(`[cors] blocked origin: ${origin}`);
      callback(null, false);
    },
  })
);
app.use(express.json({ limit: "100kb" }));

app.get("/api/health", async (req, res) => {
  // `allowedOrigins`/`callerAllowed` echo what the server actually parsed, so a
  // CORS problem can be diagnosed without redeploying to add logging.
  const body = {
    status: "ok",
    allowedOrigins: allowed.length ? allowed : "(unset — all origins allowed)",
    callerOrigin: req.headers.origin || null,
    callerAllowed: req.headers.origin ? isAllowed(req.headers.origin) : null,
  };
  try {
    await verifyTransport();
    res.json({ ...body, smtp: "connected" });
  } catch (error) {
    res.status(503).json({ ...body, status: "degraded", smtp: error.message });
  }
});

app.use("/api/webinar", webinarRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/brochure", brochureRoutes);
app.use("/api/book-preview", bookPreviewRoutes);

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
