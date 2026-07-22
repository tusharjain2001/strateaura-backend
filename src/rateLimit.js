/**
 * Minimal in-memory rate limit so a public form can't be hammered. Deliberately
 * dependency-free and per-instance: on Vercel each cold start gets its own map,
 * which is fine as a spam speed bump. Swap for Upstash/Redis if the site ever
 * needs a limit that holds across instances.
 */
const hits = new Map();

function rateLimit({ windowMs = 60 * 60 * 1000, max = 5 } = {}) {
  return (req, res, next) => {
    const key =
      req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
      req.socket?.remoteAddress ||
      "unknown";
    const now = Date.now();
    const fresh = (hits.get(key) || []).filter((t) => now - t < windowMs);

    if (fresh.length >= max) {
      res.status(429).json({
        success: false,
        error: "Too many submissions. Please try again later.",
      });
      return;
    }

    fresh.push(now);
    hits.set(key, fresh);

    // Opportunistic cleanup so the map can't grow without bound.
    if (hits.size > 5000) {
      for (const [k, times] of hits) {
        if (!times.some((t) => now - t < windowMs)) hits.delete(k);
      }
    }

    next();
  };
}

module.exports = { rateLimit };
