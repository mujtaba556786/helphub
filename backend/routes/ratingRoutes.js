const router   = require('express').Router();
const { handleAsync } = require('../middleware/auth');
const validate = require('../middleware/validate');
const s        = require('../middleware/schemas');
const ctrl     = require('../controllers/userController');

router.post('/', validate(s.createRating), handleAsync(ctrl.createRating));

module.exports = router;
