const router = require('express').Router();
const { handleAsync } = require('../middleware/auth');
const ctrl = require('../controllers/taskController');

router.post('/',              handleAsync(ctrl.createTask));
router.get('/',               handleAsync(ctrl.listTasks));
router.get('/:id',            handleAsync(ctrl.getTask));
router.post('/:id/apply',     handleAsync(ctrl.applyToTask));
router.put('/:id/assign',     handleAsync(ctrl.assignTask));
router.put('/:id/status',     handleAsync(ctrl.updateStatus));
router.delete('/:id',         handleAsync(ctrl.deleteTask));

module.exports = router;
