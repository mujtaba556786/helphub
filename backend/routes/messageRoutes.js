const router     = require('express').Router();
const { handleAsync } = require('../middleware/auth');
const ctrl       = require('../controllers/messageController');
const msgThrottle = require('../middleware/msgThrottle');

router.get('/conversations/:userId',         handleAsync(ctrl.getConversations));
router.post('/conversations',                handleAsync(ctrl.createConversation));
router.get('/messages/:conversationId',      handleAsync(ctrl.getMessages));
router.post('/messages',  msgThrottle,       handleAsync(ctrl.sendMessage));
router.put('/messages/:conversationId/read', handleAsync(ctrl.markRead));
router.get('/messages/unread-count/:userId', handleAsync(ctrl.getUnreadCount));

module.exports = router;
