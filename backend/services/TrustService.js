const pool = require('../db/pool');

async function calculateTrustScore(userId) {
    const [[user]] = await pool.query(
        'SELECT provider, created_at, rating FROM users WHERE id = ?', [userId]
    );
    if (!user) return;

    let score = 0;

    if (user.provider && user.provider !== 'Email') score += 20;

    const ageDays = (Date.now() - new Date(user.created_at)) / 86400000;
    if (ageDays > 90)      score += 25;
    else if (ageDays > 30) score += 15;

    const [[{ completed }]] = await pool.query(
        "SELECT COUNT(*) AS completed FROM bookings WHERE (customer_id = ? OR provider_id = ?) AND status = 'completed'",
        [userId, userId]
    );
    score += Math.min(completed * 5, 25);

    if (user.rating && user.rating >= 4.0) score += 15;

    const [[{ reportCount }]] = await pool.query(
        "SELECT COUNT(*) AS reportCount FROM reports WHERE reported_id = ? AND reported_type = 'user'",
        [userId]
    );
    if (reportCount === 0)      score += 15;
    else if (reportCount <= 2)  score += 5;

    const [[{ activeDays }]] = await pool.query(
        `SELECT COUNT(DISTINCT DATE(created_at)) AS activeDays
         FROM direct_messages WHERE sender_id = ?
         AND created_at > DATE_SUB(NOW(), INTERVAL 30 DAY)`,
        [userId]
    );
    score += Math.min(activeDays, 10);

    const level = score >= 70 ? 'trusted_user' : score >= 40 ? 'verified_user' : 'new_user';
    await pool.execute(
        'UPDATE users SET trust_score = ?, trust_level = ? WHERE id = ?',
        [score, level, userId]
    );
}

async function recalculateRiskScore(userId) {
    const [[{ cnt }]] = await pool.query(
        "SELECT COUNT(*) AS cnt FROM reports WHERE reported_id = ? AND reported_type = 'user'",
        [userId]
    );
    const newScore = Math.min(cnt * 20, 100);
    await pool.execute('UPDATE users SET risk_score = ? WHERE id = ?', [newScore, userId]);

    if (newScore >= 50) {
        await pool.execute(
            "UPDATE users SET status = 'Suspended' WHERE id = ? AND status = 'Active'",
            [userId]
        );
    }
    await calculateTrustScore(userId);
}

module.exports = { calculateTrustScore, recalculateRiskScore };
