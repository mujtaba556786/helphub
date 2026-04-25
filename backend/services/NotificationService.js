const pool = require('../db/pool');

async function getByUser(userId) {
    const [rows] = await pool.query(
        'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
        [userId]
    );
    return rows;
}

async function getUnreadCount(userId) {
    const [[{ count }]] = await pool.query(
        'SELECT COUNT(*) AS count FROM notifications WHERE user_id = ? AND is_read = 0',
        [userId]
    );
    return count;
}

async function markRead(notificationId) {
    await pool.execute('UPDATE notifications SET is_read = 1 WHERE id = ?', [notificationId]);
}

async function markAllRead(userId) {
    await pool.execute('UPDATE notifications SET is_read = 1 WHERE user_id = ?', [userId]);
}

module.exports = { getByUser, getUnreadCount, markRead, markAllRead };
