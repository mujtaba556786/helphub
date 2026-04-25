const router = require('express').Router();
const { handleAsync } = require('../middleware/auth');
const ctrl = require('../controllers/notificationController');

router.get('/:userId',             handleAsync(ctrl.getByUser));
router.get('/:userId/unread-count',handleAsync(ctrl.getUnreadCount));
router.put('/:id/read',            handleAsync(ctrl.markRead));
router.put('/read-all/:userId',    handleAsync(ctrl.markAllRead));

module.exports = router;
