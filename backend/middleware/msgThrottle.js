const pool = require('../db/pool');

// DB-backed message rate limit — max 10 messages per 60 seconds per user.
// Counts directly from direct_messages table so limits survive server restarts.
async function msgThrottle(req, res, next) {
    const uid = req.body.sender_id;
    if (!uid) return next();

    const [[{ recentCount }]] = await pool.query(
        'SELECT COUNT(*) AS recentCount FROM direct_messages WHERE sender_id = ? AND created_at > DATE_SUB(NOW(), INTERVAL 60 SECOND)',
        [uid]
    );

    if (recentCount >= 10) {
        return res.status(429).json({ success: false, error: 'Message rate limit: max 10 messages per minute' });
    }
    next();
}

module.exports = msgThrottle;
