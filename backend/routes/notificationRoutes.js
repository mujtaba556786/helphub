const router = require('express').Router();
const { handleAsync } = require('../middleware/auth');
const ctrl = require('../controllers/notificationController');

router.get('/:userId',             handleAsync(ctrl.getByUser));
router.get('/:userId/unread-count',handleAsync(ctrl.getUnreadCount));
router.put('/:id/read',            handleAsync(ctrl.markRead));
router.put('/read-all/:userId',    handleAsync(ctrl.markAllRead));
router.post('/device-token',       handleAsync(ctrl.saveDeviceToken));
router.delete('/device-token',     handleAsync(ctrl.deleteDeviceToken));

module.exports = router;
