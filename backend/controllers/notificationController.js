const NotificationService = require('../services/NotificationService');

async function getByUser(req, res) {
    const notifications = await NotificationService.getByUser(req.params.userId);
    res.json({ success: true, notifications });
}

async function getUnreadCount(req, res) {
    const count = await NotificationService.getUnreadCount(req.params.userId);
    res.json({ success: true, count });
}

async function markRead(req, res) {
    await NotificationService.markRead(req.params.id);
    res.json({ success: true });
}

async function markAllRead(req, res) {
    await NotificationService.markAllRead(req.params.userId);
    res.json({ success: true });
}

module.exports = { getByUser, getUnreadCount, markRead, markAllRead };
