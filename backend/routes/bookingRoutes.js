const router = require('express').Router();
const { handleAsync, requireAdmin } = require('../middleware/auth');
const ctrl = require('../controllers/bookingController');

router.get('/',                    requireAdmin,            handleAsync(ctrl.getAllAdmin));
router.post('/',                                            handleAsync(ctrl.createBooking));
router.get('/user/:id',                                     handleAsync(ctrl.getByUser));
router.put('/user/:id/mark-seen',                           handleAsync(ctrl.markSeen));
router.put('/:id/status',                                   handleAsync(ctrl.updateStatus));

module.exports = router;
