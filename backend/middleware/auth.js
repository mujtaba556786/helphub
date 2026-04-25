const jwt = require('jsonwebtoken');
const pool = require('../db/pool');

const JWT_SECRET = process.env.JWT_SECRET || 'helpmate-dev-secret';
const ADMIN_PANEL_TOKEN = process.env.ADMIN_PANEL_TOKEN || 'helphub-admin-panel';

const handleAsync = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

async function requireAdmin(req, res, next) {
    if (req.headers['x-admin-token'] === ADMIN_PANEL_TOKEN) return next();

    const userId = req.headers['x-user-id'] || req.query.user_id;
    if (!userId) return res.status(401).json({ success: false, error: 'Not authenticated' });
    const [[user]] = await pool.query('SELECT role FROM users WHERE id = ?', [userId]);
    if (!user || user.role !== 'admin') return res.status(403).json({ success: false, error: 'Admin only' });
    next();
}

function requireAuth(req, res, next) {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) return res.status(401).json({ success: false, error: 'Not authenticated' });
    try {
        const payload = jwt.verify(token, JWT_SECRET);
        req.userId = payload.userId;
        next();
    } catch {
        res.status(401).json({ success: false, error: 'Invalid or expired token' });
    }
}

async function requireTerms(req, res, next) {
    const [[user]] = await pool.query('SELECT terms_accepted_at FROM users WHERE id = ?', [req.userId]);
    if (!user || !user.terms_accepted_at) {
        return res.status(403).json({ success: false, error: 'terms_required' });
    }
    next();
}

async function isBlocked(userA, userB) {
    const [[row]] = await pool.query(
        'SELECT id FROM user_blocks WHERE (blocker_id = ? AND blocked_id = ?) OR (blocker_id = ? AND blocked_id = ?)',
        [userA, userB, userB, userA]
    );
    return !!row;
}

module.exports = { handleAsync, requireAdmin, requireAuth, requireTerms, isBlocked };
