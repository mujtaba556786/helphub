const router = require('express').Router();
const { handleAsync } = require('../middleware/auth');
const ctrl = require('../controllers/chatController');

router.post('/', handleAsync(ctrl.chat));

module.exports = router;
