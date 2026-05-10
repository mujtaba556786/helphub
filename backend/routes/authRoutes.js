const router    = require('express').Router();
const rateLimit = require('express-rate-limit');
const { handleAsync, requireAuth } = require('../middleware/auth');
const validate  = require('../middleware/validate');
const s         = require('../middleware/schemas');
const ctrl      = require('../controllers/authController');

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { success: false, error: 'Too many attempts. Please try again in 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false
});

router.post('/google',          authLimiter, validate(s.googleLogin),       handleAsync(ctrl.googleLogin));
router.post('/facebook',        authLimiter, validate(s.facebookLogin),     handleAsync(ctrl.facebookLogin));
router.post('/passwordless',    authLimiter, validate(s.passwordlessLogin), handleAsync(ctrl.passwordlessLogin));
router.post('/send-magic-link', authLimiter, validate(s.sendMagicLink),     handleAsync(ctrl.sendMagicLink));
router.get('/magic',            authLimiter,                                 handleAsync(ctrl.magicLinkCallback));
router.get('/me',                                                             handleAsync(ctrl.getMe));
router.post('/refresh',         authLimiter, validate(s.refreshToken),      handleAsync(ctrl.refreshToken));
router.post('/logout',                       validate(s.logout),             handleAsync(ctrl.logout));
router.post('/accept-terms',    requireAuth,                                 handleAsync(ctrl.acceptTerms));
router.get('/terms-version',                                                  ctrl.getTermsVersion);

module.exports = router;
