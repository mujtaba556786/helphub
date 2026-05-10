const router   = require('express').Router();
const { handleAsync } = require('../middleware/auth');
const validate = require('../middleware/validate');
const s        = require('../middleware/schemas');
const ctrl     = require('../controllers/taskController');

router.post('/',           validate(s.createTask),      handleAsync(ctrl.createTask));
router.get('/',                                          handleAsync(ctrl.listTasks));
router.get('/:id',                                       handleAsync(ctrl.getTask));
router.post('/:id/apply',  validate(s.applyToTask),     handleAsync(ctrl.applyToTask));
router.put('/:id/assign',  validate(s.assignTask),      handleAsync(ctrl.assignTask));
router.put('/:id/status',  validate(s.updateTaskStatus),handleAsync(ctrl.updateStatus));
router.delete('/:id',      validate(s.deleteTask),      handleAsync(ctrl.deleteTask));

module.exports = router;
