const crypto       = require('crypto');
const nodemailer   = require('nodemailer');
const { OAuth2Client } = require('google-auth-library');
const AuthService  = require('../services/AuthService');

const GOOGLE_CLIENT_ID  = process.env.GOOGLE_CLIENT_ID;
const googleClient      = new OAuth2Client(GOOGLE_CLIENT_ID);
const BACKEND_URL       = process.env.BACKEND_URL  || 'http://localhost:3000';
const FRONTEND_URL      = process.env.FRONTEND_URL || 'http://localhost:8080';

async function createMailTransporter() {
    if (process.env.USE_ETHEREAL === 'true') {
        const testAccount = await nodemailer.createTestAccount();
        const transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email', port: 587, secure: false,
            auth: { user: testAccount.user, pass: testAccount.pass }
        });
        return { transporter, isEthereal: true };
    }
    const host = process.env.SMTP_HOST || 'smtp.gmail.com';
    const transporter = nodemailer.createTransport({
        host, port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    });
    return { transporter, isEthereal: host.includes('ethereal.email') };
}

async function googleLogin(req, res) {
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ success: false, error: 'idToken is required' });
    if (!GOOGLE_CLIENT_ID) return res.status(500).json({ success: false, error: 'GOOGLE_CLIENT_ID not configured on server' });

    let payload;
    try {
        const ticket = await googleClient.verifyIdToken({ idToken, audience: GOOGLE_CLIENT_ID });
        payload = ticket.getPayload();
    } catch (err) {
        console.error('Google token verification failed:', err.message);
        return res.status(401).json({ success: false, error: 'Invalid Google token' });
    }

    const { email, name, picture } = payload;
    const result = await AuthService.upsertSocialUser({ email, name, avatar: picture, provider: 'Google' });
    res.json({ success: true, ...result });
}

async function facebookLogin(req, res) {
    const { accessToken: fbAccessToken } = req.body;
    if (!fbAccessToken) return res.status(400).json({ success: false, error: 'accessToken is required' });

    let fbData;
    try {
        const fbRes = await fetch(`https://graph.facebook.com/me?fields=id,name,email,picture.type(large)&access_token=${encodeURIComponent(fbAccessToken)}`);
        fbData = await fbRes.json();
    } catch (err) {
        console.error('Facebook Graph API call failed:', err.message);
        return res.status(502).json({ success: false, error: 'Could not reach Facebook API' });
    }

    if (fbData.error) {
        console.error('Facebook token invalid:', fbData.error);
        return res.status(401).json({ success: false, error: 'Invalid Facebook token' });
    }

    const email  = fbData.email || `fb_${fbData.id}@facebook.com`;
    const avatar = fbData.picture?.data?.url || null;
    const result = await AuthService.upsertSocialUser({ email, name: fbData.name, avatar, provider: 'Facebook' });
    res.json({ success: true, ...result });
}

async function passwordlessLogin(req, res) {
    const { email, role, provider } = req.body;
    if (!email) return res.status(400).json({ success: false, error: 'email is required' });
    const result = await AuthService.loginPasswordless(email, role, provider);
    res.json({ success: true, ...result });
}

async function sendMagicLink(req, res) {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, error: 'email is required' });

    const rawToken  = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    const pool      = require('../db/pool');

    await pool.execute('DELETE FROM magic_link_tokens WHERE email = ?', [email]);
    await pool.execute('INSERT INTO magic_link_tokens (token_hash, email, expires_at) VALUES (?, ?, ?)', [tokenHash, email, expiresAt]);

    const magicUrl = `${BACKEND_URL}/api/auth/magic?token=${rawToken}`;
    const { transporter, isEthereal } = await createMailTransporter();
    try {
        const info = await transporter.sendMail({
            from: process.env.SMTP_FROM || `"HelpHub" <noreply@helphub.local>`,
            to: email,
            subject: 'Sign in to HelpHub',
            html: `<div style="font-family:sans-serif;max-width:420px;margin:auto">
                    <h2 style="color:#f97316">HelpHub</h2>
                    <p>Click the button below to sign in. This link expires in <strong>15 minutes</strong> and can only be used once.</p>
                    <a href="${magicUrl}" style="display:inline-block;padding:12px 28px;background:#f97316;color:#fff;border-radius:8px;text-decoration:none;font-weight:bold;font-size:16px;margin:16px 0">Sign in to HelpHub</a>
                    <p style="color:#888;font-size:12px">If you didn't request this, you can safely ignore this email.</p>
                   </div>`
        });
        if (isEthereal) {
            const previewUrl = nodemailer.getTestMessageUrl(info);
            console.log(`\n📧 Magic link email preview (Ethereal): ${previewUrl}\n`);
            return res.json({ success: true, message: 'Sign-in link sent — check your inbox.', previewUrl });
        }
        console.log(`[AUTH] Magic link sent to ${email}`);
    } catch (err) {
        console.error('[AUTH] Failed to send magic link email:', err.message);
        console.log(`[DEV] Magic link for ${email}: ${magicUrl}`);
    }
    res.json({ success: true, message: 'Sign-in link sent — check your inbox.' });
}

async function magicLinkCallback(req, res) {
    const { token } = req.query;
    if (!token) return res.status(400).send('Missing token.');

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    try {
        const { accessToken, refreshToken } = await AuthService.consumeMagicToken(tokenHash);
        return res.redirect(`${FRONTEND_URL}/?accessToken=${encodeURIComponent(accessToken)}&refreshToken=${encodeURIComponent(refreshToken)}`);
    } catch (err) {
        const msg = err.message === 'expired'
            ? 'This sign-in link has expired. Links are valid for 15 minutes.'
            : 'This sign-in link is invalid or has already been used.';
        return res.status(400).send(`<html><body style="font-family:sans-serif;text-align:center;padding:40px">
            <h2 style="color:#f97316">HelpHub</h2><p>${msg}</p>
            <p><a href="${FRONTEND_URL}">Request a new link</a></p>
            </body></html>`);
    }
}

async function getMe(req, res) {
    const auth  = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) return res.status(401).json({ success: false, error: 'No token provided' });
    const user = await AuthService.getMe(token);
    res.json({ success: true, user });
}

async function refreshToken(req, res) {
    const { refreshToken: rt } = req.body;
    if (!rt) return res.status(400).json({ success: false, error: 'refreshToken is required' });
    const accessToken = await AuthService.refreshAccessToken(rt);
    res.json({ success: true, accessToken });
}

async function logout(req, res) {
    await AuthService.logout(req.body.refreshToken);
    res.json({ success: true, message: 'Logged out' });
}

async function acceptTerms(req, res) {
    const version = await AuthService.acceptTerms(req.userId);
    res.json({ success: true, terms_version: version });
}

function getTermsVersion(req, res) {
    res.json({ version: AuthService.CURRENT_TERMS_VERSION });
}

module.exports = {
    googleLogin, facebookLogin, passwordlessLogin,
    sendMagicLink, magicLinkCallback,
    getMe, refreshToken, logout, acceptTerms, getTermsVersion
};
