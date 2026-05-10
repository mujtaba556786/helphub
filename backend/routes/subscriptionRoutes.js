const express = require('express');
const router  = express.Router();
const { requireAuth, handleAsync } = require('../middleware/auth');
const SubscriptionService = require('../services/SubscriptionService');

// GET /api/subscription/status — provider checks their own plan + GMV
router.get('/status', requireAuth, handleAsync(async (req, res) => {
    const status = await SubscriptionService.getStatus(req.user.id);
    res.json({ success: true, ...status });
}));

module.exports = router;
