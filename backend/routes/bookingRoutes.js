const router   = require('express').Router();
const { handleAsync, requireAdmin } = require('../middleware/auth');
const validate = require('../middleware/validate');
const s        = require('../middleware/schemas');
const ctrl     = require('../controllers/bookingController');

router.get('/',                  requireAdmin,                         handleAsync(ctrl.getAllAdmin));
router.post('/',                 validate(s.createBooking),            handleAsync(ctrl.createBooking));
router.get('/user/:id',                                                handleAsync(ctrl.getByUser));
router.put('/user/:id/mark-seen',                                      handleAsync(ctrl.markSeen));
router.put('/:id/status',        validate(s.updateBookingStatus),      handleAsync(ctrl.updateStatus));

module.exports = router;
