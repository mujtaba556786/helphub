
require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET;
const JWT_SECRET = process.env.JWT_SECRET || 'helphub-dev-secret';

const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

const app = express();

// 1. Standard, wide-open CORS for local development
// This "turns off" CORS by allowing all origins, methods, and headers.
app.use(cors());

app.use(express.json());

const dbConfig = {
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '8889'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'servicelink_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    charset: 'utf8mb4'
};

let pool;

async function initDb() {
    try {
        pool = mysql.createPool(dbConfig);
        const connection = await pool.getConnection();
        console.log('✅ Connected to MAMP MySQL: servicelink_db');

        await connection.query(`
            CREATE TABLE IF NOT EXISTS users (
                id VARCHAR(50) PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                role VARCHAR(20) DEFAULT 'Customer',
                status VARCHAR(20) DEFAULT 'Active',
                avatar VARCHAR(255),
                onboarded TINYINT(1) DEFAULT 0,
                provider VARCHAR(20) DEFAULT 'Email',
                bio TEXT,
                rating FLOAT DEFAULT 5.0,
                rate FLOAT DEFAULT 0.0,
                street_name VARCHAR(100),
                street_number VARCHAR(20),
                city VARCHAR(100),
                country VARCHAR(100),
                pincode VARCHAR(20),
                languages VARCHAR(100),
                years INTEGER DEFAULT 0,
                phone VARCHAR(50),
                availability TEXT,
                service_categories TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Migration check for professional fields
        const requiredCols = [
            { name: 'rate', type: 'FLOAT DEFAULT 0.0' },
            { name: 'availability', type: 'TEXT' },
            { name: 'service_categories', type: 'TEXT' }
        ];

        for (const col of requiredCols) {
            const [rows] = await connection.query(`SHOW COLUMNS FROM users LIKE '${col.name}'`);
            if (rows.length === 0) {
                await connection.query(`ALTER TABLE users ADD COLUMN ${col.name} ${col.type}`);
            }
        }

        await connection.query(`
            CREATE TABLE IF NOT EXISTS services (
                id VARCHAR(50) PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                category VARCHAR(50),
                icon VARCHAR(10),
                description TEXT,
                status VARCHAR(20) DEFAULT 'Active'
            )
        `);

        connection.release();
        return true;
    } catch (err) {
        console.error('❌ Database Initialization Error:', err.message);
        return false;
    }
}

const handleAsync = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// --- API ROUTES ---

app.get('/api/users', handleAsync(async (req, res) => {
    const [rows] = await pool.query('SELECT * FROM users ORDER BY created_at DESC');
    res.json(rows);
}));

app.put('/api/users/:id', handleAsync(async (req, res) => {
    const { id } = req.params;
    const { name, bio, languages, years, phone, rate, availability, serviceCategories } = req.body;
    
    const availStr = Array.isArray(availability) ? availability.join(',') : (availability || "");
    const catStr = Array.isArray(serviceCategories) ? serviceCategories.join(',') : (serviceCategories || "");

    await pool.execute(
        'UPDATE users SET name = ?, bio = ?, languages = ?, years = ?, phone = ?, rate = ?, availability = ?, service_categories = ? WHERE id = ?',
        [name, bio, languages, parseInt(years || 0), phone, parseFloat(rate || 0), availStr, catStr, id]
    );
    res.json({ success: true });
}));

app.get('/api/services', handleAsync(async (req, res) => {
    const [rows] = await pool.query('SELECT * FROM services ORDER BY name ASC');
    res.json(rows);
}));

app.get('/api/bookings', handleAsync(async (req, res) => {
    const [rows] = await pool.query('SELECT * FROM bookings ORDER BY date DESC');
    res.json(rows);
}));

// ─── Helper: upsert a social-login user and return a signed JWT ──────────────
async function upsertSocialUser({ email, name, avatar, provider }) {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    let user;

    if (rows.length > 0) {
        user = rows[0];
        // Keep avatar fresh if it changed
        if (avatar && user.avatar !== avatar) {
            await pool.execute('UPDATE users SET avatar = ? WHERE id = ?', [avatar, user.id]);
            user.avatar = avatar;
        }
    } else {
        const id = 'U' + Date.now();
        const fallbackAvatar = avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`;
        await pool.execute(
            'INSERT INTO users (id, name, email, role, status, avatar, onboarded, provider) VALUES (?, ?, ?, "Customer", "Active", ?, 0, ?)',
            [id, name, email, fallbackAvatar, provider]
        );
        const [newRows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
        user = newRows[0];
    }

    const token = jwt.sign(
        { userId: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: '7d' }
    );
    return { user, token };
}

// ─── POST /api/auth/google ────────────────────────────────────────────────────
app.post('/api/auth/google', handleAsync(async (req, res) => {
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ success: false, error: 'idToken is required' });

    if (!GOOGLE_CLIENT_ID) {
        return res.status(500).json({ success: false, error: 'GOOGLE_CLIENT_ID not configured on server' });
    }

    let payload;
    try {
        const ticket = await googleClient.verifyIdToken({ idToken, audience: GOOGLE_CLIENT_ID });
        payload = ticket.getPayload();
    } catch (err) {
        console.error('Google token verification failed:', err.message);
        return res.status(401).json({ success: false, error: 'Invalid Google token' });
    }

    const { email, name, picture } = payload;
    const { user, token } = await upsertSocialUser({ email, name, avatar: picture, provider: 'Google' });
    res.json({ success: true, user, token });
}));

// ─── POST /api/auth/facebook ──────────────────────────────────────────────────
app.post('/api/auth/facebook', handleAsync(async (req, res) => {
    const { accessToken } = req.body;
    if (!accessToken) return res.status(400).json({ success: false, error: 'accessToken is required' });

    // Verify token via Facebook Graph API
    // Using Node 18+ native fetch; if on older Node, install node-fetch
    let fbData;
    try {
        const fbRes = await fetch(
            `https://graph.facebook.com/me?fields=id,name,email,picture.type(large)&access_token=${encodeURIComponent(accessToken)}`
        );
        fbData = await fbRes.json();
    } catch (err) {
        console.error('Facebook Graph API call failed:', err.message);
        return res.status(502).json({ success: false, error: 'Could not reach Facebook API' });
    }

    if (fbData.error) {
        console.error('Facebook token invalid:', fbData.error);
        return res.status(401).json({ success: false, error: 'Invalid Facebook token' });
    }

    const email = fbData.email || `fb_${fbData.id}@facebook.com`;
    const avatar = fbData.picture?.data?.url || null;
    const { user, token } = await upsertSocialUser({ email, name: fbData.name, avatar, provider: 'Facebook' });
    res.json({ success: true, user, token });
}));

// ─── POST /api/auth/passwordless ─────────────────────────────────────────────
app.post('/api/auth/passwordless', handleAsync(async (req, res) => {
    if (!pool) throw new Error("Database pool not ready");
    const { email, role, provider } = req.body;
    
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length > 0) {
        return res.json({ success: true, user: users[0] });
    } else {
        const id = 'U' + Date.now();
        const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`;
        await pool.execute(
            'INSERT INTO users (id, name, email, role, status, avatar, onboarded, provider) VALUES (?, ?, ?, ?, "Active", ?, 1, ?)',
            [id, email.split('@')[0], email, role || 'Customer', avatar, provider || 'Email']
        );
        const [newUser] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
        return res.json({ success: true, user: newUser[0] });
    }
}));

// Global Catch-all for /api
app.use('/api', (req, res) => {
    res.status(404).json({ 
        success: false, 
        error: "Endpoint not found", 
        path: req.originalUrl,
        method: req.method 
    });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error("🔥 Server Error:", err.stack);
    res.status(500).json({ 
        success: false, 
        message: "Internal Server Error", 
        error: err.message 
    });
});

const PORT = 3000;

initDb().then(success => {
    if (success) {
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`🚀 ServiceLink API Gateway Online at http://localhost:${PORT}`);
        });
    } else {
        console.error("⛔ Database connection failed. Server not started.");
    }
});
