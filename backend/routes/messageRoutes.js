const router      = require('express').Router();
const { handleAsync } = require('../middleware/auth');
const validate    = require('../middleware/validate');
const s           = require('../middleware/schemas');
const msgThrottle = require('../middleware/msgThrottle');
const ctrl        = require('../controllers/messageController');

router.get('/conversations/:userId',          handleAsync(ctrl.getConversations));
router.post('/conversations',                 validate(s.createConversation),  handleAsync(ctrl.createConversation));
router.get('/messages/:conversationId',       handleAsync(ctrl.getMessages));
router.post('/messages',  msgThrottle,        validate(s.sendMessage),         handleAsync(ctrl.sendMessage));
router.put('/messages/:conversationId/read',  validate(s.markMessagesRead),    handleAsync(ctrl.markRead));
router.get('/messages/unread-count/:userId',  handleAsync(ctrl.getUnreadCount));

module.exports = router;
