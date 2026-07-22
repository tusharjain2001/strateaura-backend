# StrateAura backend

Form backend for the StrateAura website. Two public endpoints, each of which
emails the team and sends the visitor a confirmation from `training@strateaura.com`.

## Endpoints

| Method | Path                    | Body                                                                  |
| ------ | ----------------------- | --------------------------------------------------------------------- |
| POST   | `/api/webinar/register` | `firstName, lastName, email, phone?, webinar, message?, consent?`      |
| POST   | `/api/contact`          | `firstName, lastName, email, interest, message?`                       |
| GET    | `/api/health`           | — returns `{ status, smtp }`, verifying the SMTP login                 |

Responses:

```jsonc
{ "success": true }                                  // 200
{ "success": false, "errors": { "email": "..." } }   // 400 — per-field messages
{ "success": false, "error": "Too many submissions…" } // 429
{ "success": false, "error": "We could not send…" }  // 500
```

Each form also accepts a `company` honeypot field — if it arrives filled the
submission is silently dropped and a success response returned.

## Setup

```bash
npm install
cp .env.example .env      # then fill it in
npm run check-mail -- you@example.com   # verifies SMTP + previews all 4 emails
npm run dev
```

## Notes

- The team notification decides the HTTP response; a failed visitor
  confirmation is logged but never fails the request, so a lead is never lost
  to a bounced confirmation.
- `ALLOWED_ORIGINS` must be set in production — unset means any origin.
- Rate limiting is in-memory (5 submissions per IP per hour) and therefore
  per-instance. It is a spam speed bump, not a hard guarantee; move it to
  Redis/Upstash if that becomes necessary.

## Deploying

`vercel.json` routes everything to `server.js`. Set every variable from
`.env.example` in the Vercel project settings, then deploy. The frontend needs
`VITE_API_BASE_URL` pointed at the deployed URL.
