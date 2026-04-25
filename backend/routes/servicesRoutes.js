const router = require('express').Router();
const { handleAsync } = require('../middleware/auth');
const ctrl = require('../controllers/servicesController');

router.get('/',     handleAsync(ctrl.getAll));
router.post('/',    handleAsync(ctrl.create));
router.put('/:id',  handleAsync(ctrl.update));
router.delete('/:id', handleAsync(ctrl.remove));

module.exports = router;
