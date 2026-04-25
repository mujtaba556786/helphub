const router = require('express').Router();
const { handleAsync } = require('../middleware/auth');
const ctrl = require('../controllers/userController');

// POST /api/ratings — submit or update a rating
router.post('/', handleAsync(ctrl.createRating));

module.exports = router;
