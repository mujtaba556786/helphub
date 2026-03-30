
require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { OAuth2Client } = require('google-auth-library');
const Anthropic = require('@anthropic-ai/sdk').default;
const nodemailer = require('nodemailer');

// ─── OTP store (in-memory, keyed by email) ────────────────────────────────────
// { email: { otp, expiresAt } }
const otpStore = {};

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ── Uploads directory ─────────────────────────────────────────────────────────
const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const ALLOWED_MIME = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
const avatarUpload = multer({
    storage: multer.diskStorage({
        destination: UPLOADS_DIR,
        filename: (req, file, cb) => {
            const ext = path.extname(file.originalname).toLowerCase();
            cb(null, `avatar_${req.params.id}_${uuidv4()}${ext}`);
        }
    }),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
    fileFilter: (req, file, cb) => {
        ALLOWED_MIME.includes(file.mimetype)
            ? cb(null, true)
            : cb(new Error('Only image files (jpg, png, gif, webp) are allowed'));
    }
});

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const JWT_SECRET = process.env.JWT_SECRET || 'helpmate-dev-secret';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'helpmate-refresh-secret';

// Rate limiter: max 10 requests per 15 min per IP on auth routes
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { success: false, error: 'Too many attempts. Please try again in 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false
});

const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

const app = express();

// 1. Standard, wide-open CORS for local development
// This "turns off" CORS by allowing all origins, methods, and headers.
app.use(cors());

app.use(express.json());
app.use('/uploads', express.static(UPLOADS_DIR));

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

        // Migration check for all required columns
        const requiredCols = [
            { name: 'rate',               type: 'FLOAT DEFAULT 0.0' },
            { name: 'availability',       type: 'TEXT' },
            { name: 'service_categories', type: 'TEXT' },
            { name: 'password',           type: 'VARCHAR(255)' },
            { name: 'state',              type: 'VARCHAR(100)' },
            { name: 'street_name',        type: 'VARCHAR(100)' },
            { name: 'street_number',      type: 'VARCHAR(20)' },
            { name: 'city',               type: 'VARCHAR(100)' },
            { name: 'country',            type: 'VARCHAR(100)' },
            { name: 'pincode',            type: 'VARCHAR(20)' },
            { name: 'lat',                type: 'FLOAT' },
            { name: 'lng',                type: 'FLOAT' }
        ];

        for (const col of requiredCols) {
            const [rows] = await connection.query(`SHOW COLUMNS FROM users LIKE '${col.name}'`);
            if (rows.length === 0) {
                await connection.query(`ALTER TABLE users ADD COLUMN ${col.name} ${col.type}`);
            }
        }

        await connection.query(`
            CREATE TABLE IF NOT EXISTS refresh_tokens (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id VARCHAR(50) NOT NULL,
                token_hash VARCHAR(255) NOT NULL,
                expires_at DATETIME NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_user_id (user_id),
                INDEX idx_token_hash (token_hash)
            )
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS ratings (
                id INT AUTO_INCREMENT PRIMARY KEY,
                provider_id VARCHAR(50) NOT NULL,
                user_id VARCHAR(50),
                reviewer_name VARCHAR(100),
                stars INT NOT NULL,
                comment TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_provider (provider_id)
            )
        `);

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

        // Drop old bookings table if it has wrong schema, then recreate
        const [bCols] = await connection.query(`SHOW COLUMNS FROM bookings`).catch(() => [[]]);
        const bColNames = bCols.map(c => c.Field);
        if (bColNames.length > 0 && !bColNames.includes('customer_id')) {
            await connection.query('DROP TABLE bookings');
        }
        await connection.query(`
            CREATE TABLE IF NOT EXISTS bookings (
                id VARCHAR(50) PRIMARY KEY,
                customer_id VARCHAR(50) NOT NULL,
                provider_id VARCHAR(50) NOT NULL,
                service VARCHAR(100),
                scheduled_date DATE,
                scheduled_time VARCHAR(20),
                message TEXT,
                status VARCHAR(20) DEFAULT 'pending',
                is_seen TINYINT(1) DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_customer (customer_id),
                INDEX idx_provider (provider_id)
            )
        `);
        // Add is_seen column if upgrading existing table
        await connection.query(`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS is_seen TINYINT(1) DEFAULT 0`).catch(() => {});

        await connection.query(`
            CREATE TABLE IF NOT EXISTS notifications (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id VARCHAR(50) NOT NULL,
                type VARCHAR(50) NOT NULL,
                title VARCHAR(200),
                message TEXT,
                booking_id VARCHAR(50),
                is_read TINYINT(1) DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_user (user_id),
                INDEX idx_unread (user_id, is_read)
            )
        `);

        // Seed provider lat/lng and service_categories if missing
        const providerSeeds = [
            { id: 'p1',  service_categories: 'Gardening',    lat: 52.5250, lng: 13.4100 },
            { id: 'p2',  service_categories: 'Babysitting',  lat: 52.5100, lng: 13.3900 },
            { id: 'p3',  service_categories: 'Cooking',      lat: 52.5155, lng: 13.4020 },
            { id: 'p4',  service_categories: 'IT Support',   lat: 52.5300, lng: 13.3800 },
            { id: 'p5',  service_categories: 'Moving',       lat: 52.5000, lng: 13.4200 },
            { id: 'p6',  service_categories: 'Cleaning',     lat: 52.5180, lng: 13.4250 },
            { id: 'p7',  service_categories: 'Handyman',     lat: 52.5070, lng: 13.4150 },
            { id: 'p8',  service_categories: 'Driver',       lat: 52.5220, lng: 13.3950 },
            { id: 'p9',  service_categories: 'Pet Care',     lat: 52.5130, lng: 13.4300 },
            { id: 'p10', service_categories: 'Math Tuition', lat: 52.5080, lng: 13.3850 },
            { id: 'p11', service_categories: 'Groceries',    lat: 52.5190, lng: 13.4050 }
        ];
        for (const s of providerSeeds) {
            await connection.query(
                'UPDATE users SET service_categories = ?, lat = ?, lng = ? WHERE id = ? AND (service_categories IS NULL OR service_categories = "None" OR lat IS NULL)',
                [s.service_categories, s.lat, s.lng, s.id]
            );
        }

        // Seed lat/lng for any user that has a city but no lat/lng (rough city centres)
        const cityCoords = { 'Berlin': [52.52, 13.405], 'London': [51.5074, -0.1278] };
        for (const [city, [lat, lng]] of Object.entries(cityCoords)) {
            await connection.query(
                'UPDATE users SET lat = ?, lng = ? WHERE city = ? AND lat IS NULL',
                [lat, lng, city]
            );
        }

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
    const b = req.body;

    // Postal code format validation
    if (b.pincode && !/^[A-Za-z0-9\s\-]{3,10}$/.test(b.pincode.trim())) {
        return res.status(400).json({ success: false, error: 'Invalid postal code format' });
    }

    // Build dynamic SET clause — only update fields that were actually sent
    const fields = [];
    const values = [];

    const add = (col, val) => { fields.push(`${col} = ?`); values.push(val); };

    if (b.name        !== undefined) add('name',              b.name || null);
    if (b.bio         !== undefined) add('bio',               b.bio || null);
    if (b.languages   !== undefined) add('languages',         b.languages || null);
    if (b.years       !== undefined) add('years',             parseInt(b.years || 0));
    if (b.phone       !== undefined) add('phone',             b.phone || null);
    if (b.rate        !== undefined) add('rate',              parseFloat(b.rate || 0));
    if (b.availability !== undefined) {
        add('availability', Array.isArray(b.availability) ? b.availability.join(',') : (b.availability || ''));
    }
    if (b.serviceCategories !== undefined) {
        add('service_categories', Array.isArray(b.serviceCategories) ? b.serviceCategories.join(',') : (b.serviceCategories || ''));
    }
    if (b.street_name   !== undefined) add('street_name',   b.street_name || null);
    if (b.street_number !== undefined) add('street_number', b.street_number || null);
    if (b.city          !== undefined) add('city',          b.city || null);
    if (b.state         !== undefined) add('state',         b.state || null);
    if (b.country       !== undefined) add('country',       b.country || null);
    if (b.pincode       !== undefined) add('pincode',       b.pincode || null);

    if (fields.length === 0) return res.status(400).json({ success: false, error: 'No fields to update' });

    values.push(id);
    await pool.execute(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);
    res.json({ success: true });
}));

// ── POST /api/users/:id/avatar ────────────────────────────────────────────────
app.post('/api/users/:id/avatar', avatarUpload.single('avatar'), handleAsync(async (req, res) => {
    if (!req.file) return res.status(400).json({ success: false, error: 'No file uploaded' });

    const { id } = req.params;

    // Delete previous uploaded avatar (skip external URLs like dicebear/randomuser)
    const [existing] = await pool.query('SELECT avatar FROM users WHERE id = ?', [id]);
    const oldAvatar = existing[0]?.avatar;
    if (oldAvatar && oldAvatar.startsWith('/uploads/')) {
        const oldPath = path.join(UPLOADS_DIR, path.basename(oldAvatar));
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    const avatarUrl = `/uploads/${req.file.filename}`;
    await pool.execute('UPDATE users SET avatar = ? WHERE id = ?', [avatarUrl, id]);
    res.json({ success: true, avatarUrl });
}));

// GET /api/providers — returns all users who have a service_category set
// Optional ?category=Driver to filter by specific service
app.get('/api/providers', handleAsync(async (req, res) => {
    const { category } = req.query;
    let sql = `SELECT id, name, avatar, bio, rating, rate, city, state, country,
                      lat, lng, languages, years, availability, service_categories, phone
               FROM users
               WHERE service_categories IS NOT NULL
                 AND service_categories != ''
                 AND service_categories != 'None'
                 AND lat IS NOT NULL`;
    const params = [];
    if (category) {
        sql += ' AND FIND_IN_SET(?, service_categories)';
        params.push(category);
    }
    sql += ' ORDER BY rating DESC';
    const [rows] = await pool.query(sql, params);

    // Shape into the format the frontend expects
    const providers = rows.map(u => ({
        id: u.id,
        name: u.name,
        photo: u.avatar && u.avatar.startsWith('/uploads/') ? `http://localhost:3000${u.avatar}` : (u.avatar || ''),
        bio: u.bio || '',
        rating: u.rating || 5.0,
        rate: u.rate || 0,
        currency: 'EUR',
        city: u.city || '',
        lat: u.lat,
        lng: u.lng,
        languages: u.languages || '',
        years: u.years || 0,
        availability: u.availability || 'Available Now',
        serviceType: u.service_categories ? u.service_categories.split(',')[0].trim() : '',
        phone: u.phone || ''
    }));

    res.json({ success: true, providers });
}));

// ── GET /api/providers/:id/ratings ───────────────────────────────────────────
app.get('/api/providers/:id/ratings', handleAsync(async (req, res) => {
    const [rows] = await pool.query(
        `SELECT r.id, r.stars, r.comment, r.created_at,
                COALESCE(u.name, r.reviewer_name, 'Anonymous') AS reviewer_name,
                u.avatar AS reviewer_avatar
         FROM ratings r
         LEFT JOIN users u ON u.id = r.user_id
         WHERE r.provider_id = ?
         ORDER BY r.created_at DESC`,
        [req.params.id]
    );
    res.json({ success: true, ratings: rows });
}));

// ── POST /api/ratings ─────────────────────────────────────────────────────────
app.post('/api/ratings', handleAsync(async (req, res) => {
    const { provider_id, user_id, reviewer_name, stars, comment } = req.body;
    if (!provider_id) return res.status(400).json({ success: false, error: 'provider_id is required' });
    const iStars = parseInt(stars);
    if (!iStars || iStars < 1 || iStars > 5) {
        return res.status(400).json({ success: false, error: 'stars must be 1–5' });
    }

    await pool.execute(
        'INSERT INTO ratings (provider_id, user_id, reviewer_name, stars, comment) VALUES (?, ?, ?, ?, ?)',
        [provider_id, user_id || null, reviewer_name || 'Anonymous', iStars, comment || null]
    );

    // Recalculate provider average rating
    const [[{ avg }]] = await pool.query(
        'SELECT ROUND(AVG(stars), 1) AS avg FROM ratings WHERE provider_id = ?',
        [provider_id]
    );
    await pool.execute('UPDATE users SET rating = ? WHERE id = ?', [avg, provider_id]);

    res.json({ success: true, newAverage: avg });
}));

// ── POST /api/chat ────────────────────────────────────────────────────────────
// AI chat with a provider's profile context. Uses SSE streaming.
app.post('/api/chat', handleAsync(async (req, res) => {
    const { provider_id, messages, user_id } = req.body;
    if (!provider_id || !Array.isArray(messages)) {
        return res.status(400).json({ success: false, error: 'provider_id and messages[] required' });
    }

    // Notify provider on the first message in a session
    if (messages.length === 1 && user_id && user_id !== provider_id) {
        try {
            const [[sender]] = await pool.query('SELECT name FROM users WHERE id = ?', [user_id]);
            const senderName = sender ? sender.name : 'Someone';
            await pool.execute(
                'INSERT INTO notifications (user_id, type, title, message) VALUES (?, ?, ?, ?)',
                [provider_id, 'chat', '💬 New Chat Message', `${senderName} started a chat with your profile`]
            );
        } catch (e) { console.error('Chat notification error:', e.message); }
    }

    // Fetch provider from DB for context
    const [rows] = await pool.query(
        `SELECT name, bio, rating, rate, city, country, languages, years,
                availability, service_categories, phone
         FROM users WHERE id = ?`, [provider_id]
    );
    const p = rows[0];
    if (!p) return res.status(404).json({ success: false, error: 'Provider not found' });

    const systemPrompt = `You are an AI assistant for ${p.name}, a service provider on HelpMate.

Here is ${p.name}'s profile:
- Service: ${p.service_categories || 'General'}
- Rating: ${p.rating || 5}/5
- Rate: €${p.rate || 0}/hr
- Experience: ${p.years || 0} years
- Location: ${[p.city, p.country].filter(Boolean).join(', ') || 'Not specified'}
- Languages: ${p.languages || 'Not specified'}
- Availability: ${p.availability || 'Flexible'}
- About: ${p.bio || 'Professional service provider on HelpMate.'}

Your job is to help users learn about ${p.name}, answer questions about their services, availability, and pricing. Be friendly, professional, and helpful. If asked about booking, tell them to use the HelpMate booking system. Do not make up information not provided above.`;

    // Set up SSE for streaming
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    try {
        const stream = await anthropic.messages.stream({
            model: 'claude-opus-4-6',
            max_tokens: 1024,
            system: systemPrompt,
            messages: messages.map(m => ({ role: m.role, content: m.content }))
        });

        for await (const event of stream) {
            if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
                res.write(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`);
            }
        }
        res.write('data: [DONE]\n\n');
    } catch (err) {
        console.error('Chat AI error:', err.message);
        res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
    }
    res.end();
}));

app.get('/api/services', handleAsync(async (req, res) => {
    const [rows] = await pool.query('SELECT * FROM services ORDER BY name ASC');
    res.json(rows);
}));

// ── POST /api/bookings ────────────────────────────────────────────────────────
app.post('/api/bookings', handleAsync(async (req, res) => {
    const { customer_id, provider_id, service, scheduled_date, scheduled_time, message } = req.body;
    if (!customer_id || !provider_id) {
        return res.status(400).json({ success: false, error: 'customer_id and provider_id are required' });
    }

    const id = 'B' + Date.now();
    await pool.execute(
        'INSERT INTO bookings (id, customer_id, provider_id, service, scheduled_date, scheduled_time, message) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [id, customer_id, provider_id, service || null, scheduled_date || null, scheduled_time || null, message || null]
    );

    // Fetch customer name for notification
    const [[customer]] = await pool.query('SELECT name FROM users WHERE id = ?', [customer_id]);
    const [[provider]] = await pool.query('SELECT name FROM users WHERE id = ?', [provider_id]);
    const customerName = customer?.name || 'Someone';
    const providerName = provider?.name || 'you';

    // Notify provider
    await pool.execute(
        'INSERT INTO notifications (user_id, type, title, message, booking_id) VALUES (?, ?, ?, ?, ?)',
        [
            provider_id,
            'booking_request',
            `New booking request from ${customerName}`,
            `${customerName} wants to book ${service || 'your service'}${scheduled_date ? ' on ' + scheduled_date : ''}${scheduled_time ? ' at ' + scheduled_time : ''}.`,
            id
        ]
    );

    res.json({ success: true, bookingId: id });
}));

// ── GET /api/bookings/user/:id ────────────────────────────────────────────────
app.get('/api/bookings/user/:id', handleAsync(async (req, res) => {
    const [rows] = await pool.query(
        `SELECT b.*,
                c.name AS customer_name, c.avatar AS customer_avatar,
                p.name AS provider_name, p.avatar AS provider_avatar,
                p.service_categories AS provider_service
         FROM bookings b
         LEFT JOIN users c ON c.id = b.customer_id
         LEFT JOIN users p ON p.id = b.provider_id
         WHERE b.customer_id = ? OR b.provider_id = ?
         ORDER BY b.created_at DESC`,
        [req.params.id, req.params.id]
    );
    const newCount = rows.filter(b => !b.is_seen).length;
    res.json({ success: true, bookings: rows, newCount });
}));

// ── PUT /api/bookings/user/:id/mark-seen ─────────────────────────────────────
app.put('/api/bookings/user/:id/mark-seen', handleAsync(async (req, res) => {
    await pool.execute(
        'UPDATE bookings SET is_seen = 1 WHERE (customer_id = ? OR provider_id = ?) AND is_seen = 0',
        [req.params.id, req.params.id]
    );
    res.json({ success: true });
}));

// ── PUT /api/bookings/:id/status ──────────────────────────────────────────────
app.put('/api/bookings/:id/status', handleAsync(async (req, res) => {
    const { status, user_id } = req.body; // user_id = provider making the decision
    if (!['confirmed', 'declined', 'completed'].includes(status)) {
        return res.status(400).json({ success: false, error: 'Invalid status' });
    }

    await pool.execute('UPDATE bookings SET status = ? WHERE id = ?', [status, req.params.id]);

    // Fetch booking details to notify customer
    const [[booking]] = await pool.query(
        'SELECT b.*, p.name AS provider_name FROM bookings b LEFT JOIN users p ON p.id = b.provider_id WHERE b.id = ?',
        [req.params.id]
    );
    if (booking) {
        const title = status === 'confirmed'
            ? `${booking.provider_name} confirmed your booking!`
            : status === 'declined'
            ? `${booking.provider_name} declined your booking`
            : `Booking completed`;
        const msg = status === 'confirmed'
            ? `Your booking for ${booking.service || 'a service'} has been confirmed.`
            : status === 'declined'
            ? `Your booking for ${booking.service || 'a service'} was declined. Try another helper.`
            : `Your booking with ${booking.provider_name} is marked as completed.`;

        await pool.execute(
            'INSERT INTO notifications (user_id, type, title, message, booking_id) VALUES (?, ?, ?, ?, ?)',
            [booking.customer_id, 'booking_' + status, title, msg, req.params.id]
        );
    }

    res.json({ success: true });
}));

// ── GET /api/notifications/:userId ───────────────────────────────────────────
app.get('/api/notifications/:userId', handleAsync(async (req, res) => {
    const [rows] = await pool.query(
        'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
        [req.params.userId]
    );
    res.json({ success: true, notifications: rows });
}));

// ── GET /api/notifications/:userId/unread-count ───────────────────────────────
app.get('/api/notifications/:userId/unread-count', handleAsync(async (req, res) => {
    const [[{ count }]] = await pool.query(
        'SELECT COUNT(*) AS count FROM notifications WHERE user_id = ? AND is_read = 0',
        [req.params.userId]
    );
    res.json({ success: true, count });
}));

// ── PUT /api/notifications/:id/read ──────────────────────────────────────────
app.put('/api/notifications/:id/read', handleAsync(async (req, res) => {
    await pool.execute('UPDATE notifications SET is_read = 1 WHERE id = ?', [req.params.id]);
    res.json({ success: true });
}));

// ── PUT /api/notifications/read-all/:userId ───────────────────────────────────
app.put('/api/notifications/read-all/:userId', handleAsync(async (req, res) => {
    await pool.execute('UPDATE notifications SET is_read = 1 WHERE user_id = ?', [req.params.userId]);
    res.json({ success: true });
}));

// ─── Token helpers ────────────────────────────────────────────────────────────
function issueAccessToken(user) {
    return jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '15m' });
}

async function issueRefreshToken(user) {
    const token = jwt.sign({ userId: user.id }, REFRESH_SECRET, { expiresIn: '30d' });
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await pool.execute(
        'INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)',
        [user.id, token, expiresAt]
    );
    return token;
}

async function issueTokens(user) {
    const accessToken = issueAccessToken(user);
    const refreshToken = await issueRefreshToken(user);
    return { accessToken, refreshToken };
}

// ─── Helper: upsert a social-login user and return tokens ────────────────────
async function upsertSocialUser({ email, name, avatar, provider }) {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    let user;

    if (rows.length > 0) {
        user = rows[0];
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

    return { user, ...(await issueTokens(user)) };
}

// ─── POST /api/auth/google ────────────────────────────────────────────────────
app.post('/api/auth/google', authLimiter, handleAsync(async (req, res) => {
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
    const { user, accessToken, refreshToken } = await upsertSocialUser({ email, name, avatar: picture, provider: 'Google' });
    res.json({ success: true, user, accessToken, refreshToken });
}));

// ─── POST /api/auth/facebook ──────────────────────────────────────────────────
app.post('/api/auth/facebook', authLimiter, handleAsync(async (req, res) => {
    const { accessToken: fbAccessToken } = req.body;
    if (!fbAccessToken) return res.status(400).json({ success: false, error: 'accessToken is required' });

    let fbData;
    try {
        const fbRes = await fetch(
            `https://graph.facebook.com/me?fields=id,name,email,picture.type(large)&access_token=${encodeURIComponent(fbAccessToken)}`
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
    const { user, accessToken, refreshToken } = await upsertSocialUser({ email, name: fbData.name, avatar, provider: 'Facebook' });
    res.json({ success: true, user, accessToken, refreshToken });
}));

// ─── POST /api/auth/passwordless ─────────────────────────────────────────────
// Option A: instant login if email exists in DB (no password needed)
app.post('/api/auth/passwordless', authLimiter, handleAsync(async (req, res) => {
    if (!pool) throw new Error("Database pool not ready");
    const { email, role, provider } = req.body;
    if (!email) return res.status(400).json({ success: false, error: 'email is required' });

    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    let user;

    if (users.length > 0) {
        user = users[0];
    } else {
        const id = 'U' + Date.now();
        const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`;
        await pool.execute(
            'INSERT INTO users (id, name, email, role, status, avatar, onboarded, provider) VALUES (?, ?, ?, ?, "Active", ?, 1, ?)',
            [id, email.split('@')[0], email, role || 'Customer', avatar, provider || 'Email']
        );
        const [newUser] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
        user = newUser[0];
    }

    const { accessToken, refreshToken } = await issueTokens(user);
    return res.json({ success: true, user, accessToken, refreshToken });
}));

// ─── POST /api/auth/send-otp ──────────────────────────────────────────────────
app.post('/api/auth/send-otp', authLimiter, handleAsync(async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, error: 'email is required' });

    // Generate 6-digit OTP
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    otpStore[email] = { otp, expiresAt: Date.now() + 10 * 60 * 1000 }; // 10 min

    // Send email via nodemailer (configure SMTP via .env)
    const transporter = nodemailer.createTransport({
        host:   process.env.SMTP_HOST   || 'smtp.gmail.com',
        port:   parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });

    try {
        await transporter.sendMail({
            from: process.env.SMTP_FROM || `"HelpMate" <${process.env.SMTP_USER}>`,
            to: email,
            subject: 'Your HelpMate verification code',
            html: `
                <div style="font-family:sans-serif;max-width:400px;margin:auto">
                    <h2 style="color:#f97316">HelpMate</h2>
                    <p>Your one-time verification code is:</p>
                    <h1 style="letter-spacing:8px;color:#111">${otp}</h1>
                    <p style="color:#666;font-size:13px">This code expires in 10 minutes. If you didn't request this, ignore this email.</p>
                </div>
            `
        });
        console.log(`OTP sent to ${email}`);
    } catch (err) {
        console.error('Failed to send OTP email:', err.message);
        // In dev: log OTP to console so you can still test
        console.log(`[DEV] OTP for ${email}: ${otp}`);
    }

    return res.json({ success: true, message: 'Verification code sent' });
}));

// ─── POST /api/auth/verify-otp ────────────────────────────────────────────────
app.post('/api/auth/verify-otp', authLimiter, handleAsync(async (req, res) => {
    if (!pool) throw new Error("Database pool not ready");
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ success: false, error: 'email and otp are required' });

    const record = otpStore[email];
    if (!record) return res.status(400).json({ success: false, error: 'No code found for this email. Please request a new one.' });
    if (Date.now() > record.expiresAt) {
        delete otpStore[email];
        return res.status(400).json({ success: false, error: 'Code expired. Please request a new one.' });
    }
    if (record.otp !== String(otp)) {
        return res.status(400).json({ success: false, error: 'Incorrect code. Please try again.' });
    }

    // OTP is valid — consume it
    delete otpStore[email];

    // Find or create user
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    let user;
    if (users.length > 0) {
        user = users[0];
    } else {
        const id = 'U' + Date.now();
        const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`;
        await pool.execute(
            'INSERT INTO users (id, name, email, role, status, avatar, onboarded, provider) VALUES (?, ?, ?, "Customer", "Active", ?, 1, "Email")',
            [id, email.split('@')[0], email, avatar]
        );
        const [newUser] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
        user = newUser[0];
    }

    const { accessToken, refreshToken } = await issueTokens(user);
    return res.json({ success: true, user, accessToken, refreshToken });
}));

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
// Returns the logged-in user from a valid JWT access token
app.get('/api/auth/me', handleAsync(async (req, res) => {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) return res.status(401).json({ success: false, error: 'No token provided' });

    let payload;
    try { payload = jwt.verify(token, JWT_SECRET); }
    catch { return res.status(401).json({ success: false, error: 'Invalid or expired token' }); }

    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [payload.userId]);
    if (!rows.length) return res.status(404).json({ success: false, error: 'User not found' });

    res.json({ success: true, user: rows[0] });
}));

// ─── POST /api/auth/refresh ───────────────────────────────────────────────────
// Swap a valid refresh token for a new access token
app.post('/api/auth/refresh', handleAsync(async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ success: false, error: 'refreshToken is required' });

    let payload;
    try {
        payload = jwt.verify(refreshToken, REFRESH_SECRET);
    } catch {
        return res.status(401).json({ success: false, error: 'Invalid or expired refresh token' });
    }

    const [rows] = await pool.query(
        'SELECT * FROM refresh_tokens WHERE user_id = ? AND token_hash = ? AND expires_at > NOW()',
        [payload.userId, refreshToken]
    );
    if (rows.length === 0) return res.status(401).json({ success: false, error: 'Refresh token revoked or expired' });

    const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [payload.userId]);
    if (users.length === 0) return res.status(401).json({ success: false, error: 'User not found' });

    const accessToken = issueAccessToken(users[0]);
    res.json({ success: true, accessToken });
}));

// ─── POST /api/auth/logout ────────────────────────────────────────────────────
app.post('/api/auth/logout', handleAsync(async (req, res) => {
    const { refreshToken } = req.body;
    if (refreshToken) {
        await pool.execute('DELETE FROM refresh_tokens WHERE token_hash = ?', [refreshToken]);
    }
    res.json({ success: true, message: 'Logged out' });
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
