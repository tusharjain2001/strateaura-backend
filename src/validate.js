// Submitted values are interpolated into HTML emails, so everything that goes
// into a template must be escaped — otherwise a submission containing markup
// would render as markup in the team's inbox.
function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function clean(value, maxLength = 2000) {
  return String(value ?? "").trim().slice(0, maxLength);
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validates a submission against a field spec and returns the trimmed values.
 *
 * spec: { name: { required, email, max, label } }
 */
function validate(body, spec) {
  const errors = {};
  const values = {};

  for (const [field, rules] of Object.entries(spec)) {
    const value = clean(body?.[field], rules.max ?? 2000);
    values[field] = value;

    const label = rules.label || field;
    if (rules.required && !value) {
      errors[field] = `${label} is required.`;
    } else if (value && rules.email && !EMAIL_RE.test(value)) {
      errors[field] = "Please enter a valid email address.";
    }
  }

  return { values, errors, valid: Object.keys(errors).length === 0 };
}

module.exports = { validate, escapeHtml, clean };
