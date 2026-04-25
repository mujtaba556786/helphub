const router = require('express').Router();
const { handleAsync, requireAuth } = require('../middleware/auth');
const ctrl = require('../controllers/authController');
const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { success: false, error: 'Too many attempts. Please try again in 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false
});

router.post('/google',          authLimiter, handleAsync(ctrl.googleLogin));
router.post('/facebook',        authLimiter, handleAsync(ctrl.facebookLogin));
router.post('/passwordless',    authLimiter, handleAsync(ctrl.passwordlessLogin));
router.post('/send-magic-link', authLimiter, handleAsync(ctrl.sendMagicLink));
router.get('/magic',            authLimiter, handleAsync(ctrl.magicLinkCallback));
router.get('/me',                            handleAsync(ctrl.getMe));
router.post('/refresh',         authLimiter, handleAsync(ctrl.refreshToken));
router.post('/logout',                       handleAsync(ctrl.logout));
router.post('/accept-terms',    requireAuth, handleAsync(ctrl.acceptTerms));
router.get('/terms-version',                 ctrl.getTermsVersion);

module.exports = router;
