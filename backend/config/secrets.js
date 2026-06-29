// Single source of truth for JWT signing secrets.
//
// Both AuthService (which SIGNS tokens) and middleware/auth.js (which VERIFIES them)
// must use the EXACT same secret. Previously each resolved its own — AuthService used a
// random per-boot fallback while auth.js used the hardcoded 'helpmate-dev-secret', so
// when JWT_SECRET was unset the sign/verify keys diverged and every authenticated call
// (e.g. accept-terms) failed with 401. Resolving here once and sharing fixes that.
//
// In production we never use the hardcoded dev value (anyone reading the source could
// forge tokens); if the env var is unset we generate a strong RANDOM per-boot secret —
// secure, but it changes on each restart, so JWT_SECRET/REFRESH_SECRET SHOULD still be
// set explicitly so logins survive redeploys.

const crypto = require('crypto');

function resolveSecret(name, devDefault) {
    if (process.env[name]) return process.env[name];
    if (process.env.NODE_ENV === 'production') {
        console.warn(`[SECURITY] ${name} is not set — using a random per-boot secret. ` +
            `Set ${name} in the environment so sessions survive restarts.`);
        return crypto.randomBytes(48).toString('hex');
    }
    return devDefault;
}

// Resolved once at module load and cached by Node, so every importer shares one value.
const JWT_SECRET     = resolveSecret('JWT_SECRET',     'helpmate-dev-secret');
const REFRESH_SECRET = resolveSecret('REFRESH_SECRET', 'helpmate-refresh-secret');

module.exports = { JWT_SECRET, REFRESH_SECRET, resolveSecret };
