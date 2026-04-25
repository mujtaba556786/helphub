const router = require('express').Router();
const { handleAsync, requireAdmin, requireAuth } = require('../middleware/auth');
const ctrl = require('../controllers/adminController');

// ── Stats (public-ish) ────────────────────────────────────────────────────────
router.get('/stats',                              handleAsync(ctrl.getStats));

// ── Reviews ───────────────────────────────────────────────────────────────────
router.get('/admin/reviews',                      requireAdmin, handleAsync(ctrl.getReviews));
router.put('/admin/reviews/:id/approve',          requireAdmin, handleAsync(ctrl.approveReview));
router.put('/admin/reviews/:id/reject',           requireAdmin, handleAsync(ctrl.rejectReview));
router.delete('/admin/reviews/:id',               requireAdmin, handleAsync(ctrl.deleteReview));

// ── Admin blocks ──────────────────────────────────────────────────────────────
router.get('/admin/blocks',                       requireAdmin, handleAsync(ctrl.getBlocks));
router.delete('/admin/blocks/:id',                requireAdmin, handleAsync(ctrl.deleteBlock));

// ── Reports ───────────────────────────────────────────────────────────────────
router.get('/admin/reports',                      requireAdmin, handleAsync(ctrl.getReports));
router.put('/admin/reports/:id/action',           requireAdmin, handleAsync(ctrl.actionReport));

// ── Flagged users & user actions ──────────────────────────────────────────────
router.get('/admin/flagged-users',                requireAdmin, handleAsync(ctrl.getFlaggedUsers));
router.put('/admin/users/:id/action',             requireAdmin, handleAsync(ctrl.actionUser));

// ── User-side blocking ────────────────────────────────────────────────────────
router.post('/users/:id/block',                   requireAuth,  handleAsync(ctrl.blockUser));
router.delete('/users/:id/block',                 requireAuth,  handleAsync(ctrl.unblockUser));
router.get('/users/me/blocks',                    requireAuth,  handleAsync(ctrl.getMyBlocks));

// ── Reporting ─────────────────────────────────────────────────────────────────
router.post('/reports',                           requireAuth,  handleAsync(ctrl.submitReport));

module.exports = router;
