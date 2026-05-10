const pool = require('../db/pool');
const { calculateTrustScore, recalculateRiskScore } = require('./TrustService');

// ── Reviews ──────────────────────────────────────────────────────────────────

async function getReviews(status) {
    const sStatus = status || 'pending';
    const base = `SELECT r.id, r.stars, r.comment, r.status, r.created_at,
                         r.provider_id,
                         COALESCE(u.name, r.reviewer_name, 'Anonymous') AS reviewer_name,
                         p.name AS provider_name
                  FROM ratings r
                  LEFT JOIN users u ON u.id = r.user_id
                  LEFT JOIN users p ON p.id = r.provider_id`;

    const [rows] = sStatus === 'all'
        ? await pool.query(`${base} ORDER BY r.created_at DESC`)
        : await pool.query(`${base} WHERE r.status = ? ORDER BY r.created_at DESC`, [sStatus]);

    return rows;
}

async function _recalcProviderRating(reviewId) {
    const [[review]] = await pool.query('SELECT provider_id FROM ratings WHERE id = ?', [reviewId]);
    if (!review) throw Object.assign(new Error('Review not found'), { status: 404 });
    const [[{ avg }]] = await pool.query(
        "SELECT ROUND(AVG(stars), 1) AS avg FROM ratings WHERE provider_id = ? AND status != 'rejected'",
        [review.provider_id]
    );
    await pool.execute('UPDATE users SET rating = ? WHERE id = ?', [avg || null, review.provider_id]);
    return { avg, providerId: review.provider_id };
}

async function approveReview(id) {
    await pool.execute("UPDATE ratings SET status = 'approved' WHERE id = ?", [id]);
    const { avg } = await _recalcProviderRating(id);
    return avg;
}

async function rejectReview(id) {
    await pool.execute("UPDATE ratings SET status = 'rejected' WHERE id = ?", [id]);
    const { avg } = await _recalcProviderRating(id);
    return avg;
}

async function deleteReview(id) {
    const [[review]] = await pool.query('SELECT provider_id FROM ratings WHERE id = ?', [id]);
    if (!review) throw Object.assign(new Error('Review not found'), { status: 404 });
    await pool.execute('DELETE FROM ratings WHERE id = ?', [id]);
    const [[{ avg }]] = await pool.query(
        "SELECT ROUND(AVG(stars), 1) AS avg FROM ratings WHERE provider_id = ? AND status != 'rejected'",
        [review.provider_id]
    );
    await pool.execute('UPDATE users SET rating = ? WHERE id = ?', [avg || null, review.provider_id]);
}

// ── Stats ─────────────────────────────────────────────────────────────────────

async function getStats() {
    const [[{ totalUsers }]]       = await pool.query("SELECT COUNT(*) AS totalUsers FROM users");
    const [[{ totalBookings }]]    = await pool.query("SELECT COUNT(*) AS totalBookings FROM bookings");
    const [[{ pendingInquiries }]] = await pool.query("SELECT COUNT(*) AS pendingInquiries FROM bookings WHERE status = 'pending'");
    const [[{ adClicks }]]         = await pool.query("SELECT COUNT(*) AS adClicks FROM bookings WHERE status = 'completed'");
    const [[{ avgRating }]]        = await pool.query("SELECT ROUND(AVG(stars), 1) AS avgRating FROM ratings WHERE status = 'approved'");

    const [engRows] = await pool.query(`
        SELECT DATE_FORMAT(MIN(created_at), '%b') AS month, COUNT(*) AS value
        FROM bookings
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
        GROUP BY DATE_FORMAT(created_at, '%Y-%m')
        ORDER BY DATE_FORMAT(created_at, '%Y-%m') ASC
    `);

    const [catRows] = await pool.query(`
        SELECT service_categories AS name, COUNT(*) AS value
        FROM users
        WHERE service_categories IS NOT NULL AND service_categories != '' AND service_categories != 'None'
        GROUP BY service_categories
        ORDER BY COUNT(*) DESC
        LIMIT 5
    `);

    return {
        totalUsers,
        adImpressions: totalBookings,
        adClicks,
        pendingInquiries,
        averageRating: parseFloat(avgRating) || 5.0,
        engagementData: engRows.length ? engRows : [
            { month: 'Jan', value: 0 }, { month: 'Feb', value: 0 }, { month: 'Mar', value: 0 }
        ],
        categoryData: catRows.length ? catRows : [{ name: 'General', value: 1 }]
    };
}

// ── Blocks ────────────────────────────────────────────────────────────────────

async function getBlocks() {
    const [rows] = await pool.query(
        `SELECT ub.id, ub.blocker_id, ub.blocked_id, ub.created_at,
                u1.name AS blocker_name, u1.email AS blocker_email,
                u2.name AS blocked_name, u2.email AS blocked_email
         FROM user_blocks ub
         LEFT JOIN users u1 ON u1.id = ub.blocker_id
         LEFT JOIN users u2 ON u2.id = ub.blocked_id
         ORDER BY ub.created_at DESC`
    );
    return rows;
}

async function deleteBlock(id) {
    await pool.execute('DELETE FROM user_blocks WHERE id = ?', [id]);
}

// ── Reports ───────────────────────────────────────────────────────────────────

async function getReports({ page, limit, status }) {
    const p      = Math.max(1, parseInt(page)  || 1);
    const lim    = Math.min(50, parseInt(limit) || 20);
    const offset = (p - 1) * lim;

    let sql = `
        SELECT r.*,
               reporter.name AS reporter_name,
               reporter.email AS reporter_email,
               reported_user.name AS reported_name
        FROM reports r
        LEFT JOIN users reporter      ON reporter.id      = r.reporter_id
        LEFT JOIN users reported_user ON reported_user.id = r.reported_id AND r.reported_type = 'user'
        WHERE 1=1`;
    const params = [];
    if (status) { sql += ' AND r.status = ?'; params.push(status); }
    sql += ' ORDER BY r.created_at DESC LIMIT ? OFFSET ?';
    params.push(lim, offset);

    const [rows] = await pool.query(sql, params);
    const [[{ total }]] = await pool.query(
        'SELECT COUNT(*) AS total FROM reports' + (status ? ' WHERE status = ?' : ''),
        status ? [status] : []
    );
    return { reports: rows, total, page: p, limit: lim };
}

async function actionReport(id, status) {
    if (!['reviewed', 'actioned'].includes(status)) {
        throw Object.assign(new Error('status must be reviewed or actioned'), { status: 400 });
    }
    await pool.execute('UPDATE reports SET status = ? WHERE id = ?', [status, id]);
}

// ── Flagged users ─────────────────────────────────────────────────────────────

async function getFlaggedUsers() {
    const [rows] = await pool.query(
        `SELECT id, name, email, status, risk_score, trust_score, trust_level, created_at
         FROM users WHERE risk_score > 40 ORDER BY risk_score DESC`
    );
    return rows;
}

async function actionUser(id, action) {
    if (!['warn', 'restrict', 'ban', 'clear'].includes(action)) {
        throw Object.assign(new Error('action must be warn | restrict | ban | clear'), { status: 400 });
    }
    if (action === 'warn') {
        await pool.execute(
            "INSERT INTO notifications (user_id, type, title, message) VALUES (?, 'admin_warning', 'Account Warning', 'Your account has received a warning due to reported behavior. Please review our community guidelines.')",
            [id]
        );
    } else if (action === 'restrict') {
        await pool.execute("UPDATE users SET status = 'Suspended' WHERE id = ?", [id]);
    } else if (action === 'ban') {
        await pool.execute("UPDATE users SET status = 'Blocked' WHERE id = ?", [id]);
    } else if (action === 'clear') {
        await pool.execute("UPDATE users SET status = 'Active', risk_score = 0 WHERE id = ?", [id]);
        await calculateTrustScore(id);
    }
}

// ── User-side blocking & reporting ────────────────────────────────────────────

async function blockUser(blockerId, blockedId) {
    if (blockerId === blockedId) throw Object.assign(new Error('Cannot block yourself'), { status: 400 });
    await pool.execute('INSERT IGNORE INTO user_blocks (blocker_id, blocked_id) VALUES (?, ?)', [blockerId, blockedId]);
}

async function unblockUser(blockerId, blockedId) {
    await pool.execute('DELETE FROM user_blocks WHERE blocker_id = ? AND blocked_id = ?', [blockerId, blockedId]);
}

async function getMyBlocks(userId) {
    const [rows] = await pool.query(
        `SELECT b.blocked_id, u.name, u.avatar
         FROM user_blocks b JOIN users u ON u.id = b.blocked_id
         WHERE b.blocker_id = ?`,
        [userId]
    );
    return rows;
}

async function submitReport(reporterId, { reported_type, reported_id, category, description }) {
    if (!reported_type || !reported_id || !category) {
        throw Object.assign(new Error('reported_type, reported_id, and category are required'), { status: 400 });
    }
    await pool.execute(
        'INSERT INTO reports (reporter_id, reported_type, reported_id, category, description) VALUES (?, ?, ?, ?, ?)',
        [reporterId, reported_type, reported_id, category, description || null]
    );
    if (reported_type === 'user') await recalculateRiskScore(reported_id);
}

module.exports = {
    getReviews, approveReview, rejectReview, deleteReview,
    getStats,
    getBlocks, deleteBlock,
    getReports, actionReport,
    getFlaggedUsers, actionUser,
    blockUser, unblockUser, getMyBlocks, submitReport
};
