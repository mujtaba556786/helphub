const svc             = require('../services/AdminService');
const SubscriptionSvc = require('../services/SubscriptionService');

// ── Reviews ───────────────────────────────────────────────────────────────────
async function getReviews(req, res) {
    const reviews = await svc.getReviews(req.query.status);
    res.json({ success: true, reviews });
}

async function approveReview(req, res) {
    const newAverage = await svc.approveReview(req.params.id);
    res.json({ success: true, newAverage });
}

async function rejectReview(req, res) {
    const newAverage = await svc.rejectReview(req.params.id);
    res.json({ success: true, newAverage });
}

async function deleteReview(req, res) {
    await svc.deleteReview(req.params.id);
    res.json({ success: true });
}

// ── Stats ─────────────────────────────────────────────────────────────────────
async function getStats(req, res) {
    const stats = await svc.getStats();
    res.json(stats);
}

// ── Blocks (admin) ────────────────────────────────────────────────────────────
async function getBlocks(req, res) {
    const blocks = await svc.getBlocks();
    res.json({ success: true, blocks });
}

async function deleteBlock(req, res) {
    await svc.deleteBlock(req.params.id);
    res.json({ success: true });
}

// ── Reports ───────────────────────────────────────────────────────────────────
async function getReports(req, res) {
    const result = await svc.getReports(req.query);
    res.json({ success: true, ...result });
}

async function actionReport(req, res) {
    await svc.actionReport(req.params.id, req.body.status);
    res.json({ success: true });
}

// ── Flagged users ─────────────────────────────────────────────────────────────
async function getFlaggedUsers(req, res) {
    const users = await svc.getFlaggedUsers();
    res.json({ success: true, users });
}

async function actionUser(req, res) {
    await svc.actionUser(req.params.id, req.body.action);
    res.json({ success: true });
}

// ── User-side blocking & reporting ────────────────────────────────────────────
async function blockUser(req, res) {
    await svc.blockUser(req.userId, req.params.id);
    res.json({ success: true });
}

async function unblockUser(req, res) {
    await svc.unblockUser(req.userId, req.params.id);
    res.json({ success: true });
}

async function getMyBlocks(req, res) {
    const blocked = await svc.getMyBlocks(req.userId);
    res.json({ success: true, blocked });
}

async function submitReport(req, res) {
    await svc.submitReport(req.userId, req.body);
    res.json({ success: true });
}

// ── Subscription plan management ──────────────────────────────────────────────
async function setSubscriptionPlan(req, res) {
    const result = await SubscriptionSvc.setSubscriptionPlan(req.params.id, req.body.plan);
    res.json({ success: true, ...result });
}

// ── Featured provider management ──────────────────────────────────────────────
async function featureProvider(req, res) {
    const { days = 7, category = null } = req.body;
    const pool = require('../db/pool');
    await pool.query(
        `UPDATE users
         SET featured_until = DATE_ADD(NOW(), INTERVAL ? DAY),
             featured_category = ?
         WHERE id = ?`,
        [days, category, req.params.id]
    );
    res.json({ success: true, featured_days: days, category });
}

async function unfeatureProvider(req, res) {
    const pool = require('../db/pool');
    await pool.query(
        'UPDATE users SET featured_until = NULL, featured_category = NULL WHERE id = ?',
        [req.params.id]
    );
    res.json({ success: true });
}

module.exports = {
    getReviews, approveReview, rejectReview, deleteReview,
    getStats,
    getBlocks, deleteBlock,
    getReports, actionReport,
    getFlaggedUsers, actionUser,
    blockUser, unblockUser, getMyBlocks, submitReport,
    setSubscriptionPlan, featureProvider, unfeatureProvider
};
