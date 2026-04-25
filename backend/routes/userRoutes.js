const router = require('express').Router();
const path = require('path');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const { handleAsync } = require('../middleware/auth');
const ctrl = require('../controllers/userController');

const UPLOADS_DIR = path.join(__dirname, '../uploads');
const ALLOWED_MIME = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

const avatarUpload = multer({
    storage: multer.diskStorage({
        destination: UPLOADS_DIR,
        filename: (req, file, cb) => {
            const ext = path.extname(file.originalname).toLowerCase();
            cb(null, `avatar_${req.params.id}_${uuidv4()}${ext}`);
        }
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        ALLOWED_MIME.includes(file.mimetype)
            ? cb(null, true)
            : cb(new Error('Only image files (jpg, png, gif, webp) are allowed'));
    }
});

router.get('/',                         handleAsync(ctrl.getAll));
router.put('/:id',                      handleAsync(ctrl.updateUser));
router.post('/:id/avatar',              avatarUpload.single('avatar'), handleAsync(ctrl.uploadAvatar));
router.put('/:id/status',               handleAsync(ctrl.updateStatus));
router.put('/:id/approve',              handleAsync(ctrl.approveUser));
router.put('/:id/onboard',              handleAsync(ctrl.onboardUser));
router.put('/:id/profile',              handleAsync(ctrl.updateProfile));

module.exports = router;
