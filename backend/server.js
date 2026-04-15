
require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });
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
            CREATE TABLE IF NOT EXISTS magic_link_tokens (
                id INT AUTO_INCREMENT PRIMARY KEY,
                token_hash VARCHAR(255) NOT NULL UNIQUE,
                email VARCHAR(100) NOT NULL,
                expires_at DATETIME NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_ml_token_hash (token_hash),
                INDEX idx_ml_email (email)
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
                status VARCHAR(20) DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_provider (provider_id)
            )
        `);
        // Add status column to existing ratings tables that predate this migration
        // Use SHOW COLUMNS to check first — avoids syntax issues on MySQL < 8.0
        const [ratingCols] = await connection.query(`SHOW COLUMNS FROM ratings LIKE 'status'`);
        if (ratingCols.length === 0) {
            await connection.query(`ALTER TABLE ratings ADD COLUMN status VARCHAR(20) DEFAULT 'pending'`).catch(() => {});
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

        // Seed / refresh default services (REPLACE INTO keeps the catalog in sync on every restart)
        const defaultServices = [
            // Home
            ['S1',  'Cleaning',     'Home',      '🧹', 'Home and office cleaning by vetted professionals.'],
            ['S2',  'Gardening',    'Home',      '🌱', 'Lawn care, planting, and garden maintenance.'],
            ['S3',  'Handyman',     'Home',      '🔧', 'General home repairs and installations.'],
            // Care
            ['S4',  'Babysitting',  'Care',      '👶', 'Trusted childcare in your own home.'],
            ['S5',  'Elder Care',   'Care',      '🧓', 'Companionship, light assistance, and care for elderly.'],
            ['S6',  'Pet Care',     'Care',      '🐕', 'Dog walking, pet sitting, and grooming.'],
            // Transport
            ['S7',  'Transport',    'Transport', '🚗', 'Reliable rides for errands, events, and daily travel.'],
            ['S8',  'Groceries',    'Transport', '🛒', 'Grocery shopping and delivery to your door.'],
            // Wellness
            ['S9',  'Cooking',      'Wellness',  '👨‍🍳', 'Home-cooked meals prepared fresh by local chefs.'],
            ['S10', 'Massage',      'Wellness',  '💆', 'Professional home massage for relaxation and recovery.'],
            // Skills
            ['S11', 'Math Tuition', 'Skills',    '📐', 'One-on-one math lessons for all ages and levels.'],
            ['S12', 'IT Support',   'Skills',    '💻', 'Tech help, device setup, and troubleshooting.'],
        ];
        // Delete stale entries not in the current catalog, then upsert
        await connection.query(`DELETE FROM services WHERE id IN ('S13','S14','S15')`);
        for (const [id, name, category, icon, description] of defaultServices) {
            await connection.query(
                'REPLACE INTO services (id, name, category, icon, description, status) VALUES (?, ?, ?, ?, ?, ?)',
                [id, name, category, icon, description, 'Active']
            );
        }

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

        // ── Direct Messaging tables ──────────────────────────────────────
        await connection.query(`
            CREATE TABLE IF NOT EXISTS conversations (
                id VARCHAR(50) PRIMARY KEY,
                participant_1 VARCHAR(50) NOT NULL,
                participant_2 VARCHAR(50) NOT NULL,
                last_message TEXT,
                last_message_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_p1 (participant_1),
                INDEX idx_p2 (participant_2)
            )
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS direct_messages (
                id VARCHAR(50) PRIMARY KEY,
                conversation_id VARCHAR(50) NOT NULL,
                sender_id VARCHAR(50) NOT NULL,
                content TEXT NOT NULL,
                is_read TINYINT(1) DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_conversation (conversation_id),
                INDEX idx_sender (sender_id),
                INDEX idx_unread (conversation_id, is_read)
            )
        `);

        // ── Post a Task tables ──────────────────────────────────────────
        await connection.query(`
            CREATE TABLE IF NOT EXISTS tasks (
                id VARCHAR(50) PRIMARY KEY,
                poster_id VARCHAR(50) NOT NULL,
                assigned_provider_id VARCHAR(50),
                title VARCHAR(200) NOT NULL,
                description TEXT,
                category VARCHAR(50) NOT NULL,
                budget FLOAT,
                task_date DATE,
                location VARCHAR(200),
                status VARCHAR(20) DEFAULT 'open',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_poster (poster_id),
                INDEX idx_status (status),
                INDEX idx_category (category)
            )
        `);

        // Add lat/lng to tasks if not present (safe to run on existing tables)
        try {
            await connection.query('ALTER TABLE tasks ADD COLUMN lat FLOAT');
        } catch(e) { /* column already exists */ }
        try {
            await connection.query('ALTER TABLE tasks ADD COLUMN lng FLOAT');
        } catch(e) { /* column already exists */ }

        await connection.query(`
            CREATE TABLE IF NOT EXISTS task_applications (
                id VARCHAR(50) PRIMARY KEY,
                task_id VARCHAR(50) NOT NULL,
                provider_id VARCHAR(50) NOT NULL,
                message TEXT,
                status VARCHAR(20) DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_task (task_id),
                INDEX idx_provider (provider_id)
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
            { id: 'p8',  service_categories: 'Transport',    lat: 52.5220, lng: 13.3950 },
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
    if (b.lat           !== undefined) add('lat',           parseFloat(b.lat) || null);
    if (b.lng           !== undefined) add('lng',           parseFloat(b.lng) || null);

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
        serviceType: u.service_categories || '',
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
         WHERE r.provider_id = ? AND r.status = 'approved'
         ORDER BY r.created_at DESC`,
        [req.params.id]
    );
    res.json({ success: true, ratings: rows });
}));

// ── POST /api/ratings ─────────────────────────────────────────────────────────
app.post('/api/ratings', handleAsync(async (req, res) => {
    const { provider_id, user_id, reviewer_name, stars, comment } = req.body;
    if (!provider_id) return res.status(400).json({ success: false, error: 'provider_id is required' });
    if (!user_id)     return res.status(400).json({ success: false, error: 'user_id is required — must be logged in to rate' });
    if (user_id === provider_id) return res.status(400).json({ success: false, error: 'You cannot rate yourself' });
    const iStars = parseInt(stars);
    if (!iStars || iStars < 1 || iStars > 5) {
        return res.status(400).json({ success: false, error: 'stars must be 1–5' });
    }

    // Check if user already rated this provider
    const [[existing]] = await pool.query(
        'SELECT id FROM ratings WHERE provider_id = ? AND user_id = ?',
        [provider_id, user_id]
    );

    if (existing) {
        // Reset to pending on update so admin re-reviews
        await pool.execute(
            'UPDATE ratings SET stars = ?, comment = ?, reviewer_name = ?, status = ?, created_at = NOW() WHERE provider_id = ? AND user_id = ?',
            [iStars, comment || null, reviewer_name || 'Anonymous', 'pending', provider_id, user_id]
        );
    } else {
        await pool.execute(
            'INSERT INTO ratings (provider_id, user_id, reviewer_name, stars, comment, status) VALUES (?, ?, ?, ?, ?, ?)',
            [provider_id, user_id, reviewer_name || 'Anonymous', iStars, comment || null, 'pending']
        );
    }

    // Recalculate provider average (approved reviews only)
    const [[{ avg }]] = await pool.query(
        "SELECT ROUND(AVG(stars), 1) AS avg FROM ratings WHERE provider_id = ? AND status = 'approved'",
        [provider_id]
    );
    await pool.execute('UPDATE users SET rating = ? WHERE id = ?', [avg || 0, provider_id]);

    res.json({ success: true, newAverage: avg, updated: !!existing, pending: true });
}));

// ── ADMIN MIDDLEWARE ──────────────────────────────────────────────────────────
const ADMIN_PANEL_TOKEN = process.env.ADMIN_PANEL_TOKEN || 'helphub-admin-panel';

async function requireAdmin(req, res, next) {
    // Allow the backend admin panel via shared secret token
    if (req.headers['x-admin-token'] === ADMIN_PANEL_TOKEN) return next();

    const userId = req.headers['x-user-id'] || req.query.user_id;
    if (!userId) return res.status(401).json({ success: false, error: 'Not authenticated' });
    const [[user]] = await pool.query('SELECT role FROM users WHERE id = ?', [userId]);
    if (!user || user.role !== 'admin') return res.status(403).json({ success: false, error: 'Admin only' });
    next();
}

// ── GET /api/admin/reviews ────────────────────────────────────────────────────
app.get('/api/admin/reviews', requireAdmin, handleAsync(async (req, res) => {
    const sStatus = req.query.status || 'pending';
    // 'all' fetches every status for the admin panel overview
    const [rows] = sStatus === 'all'
        ? await pool.query(
            `SELECT r.id, r.stars, r.comment, r.status, r.created_at,
                    r.provider_id,
                    COALESCE(u.name, r.reviewer_name, 'Anonymous') AS reviewer_name,
                    p.name AS provider_name
             FROM ratings r
             LEFT JOIN users u ON u.id = r.user_id
             LEFT JOIN users p ON p.id = r.provider_id
             ORDER BY r.created_at DESC`
          )
        : await pool.query(
            `SELECT r.id, r.stars, r.comment, r.status, r.created_at,
                    r.provider_id,
                    COALESCE(u.name, r.reviewer_name, 'Anonymous') AS reviewer_name,
                    p.name AS provider_name
             FROM ratings r
             LEFT JOIN users u ON u.id = r.user_id
             LEFT JOIN users p ON p.id = r.provider_id
             WHERE r.status = ?
             ORDER BY r.created_at DESC`,
            [sStatus]
          );
    res.json({ success: true, reviews: rows });
}));

// ── PUT /api/admin/reviews/:id/approve ────────────────────────────────────────
app.put('/api/admin/reviews/:id/approve', requireAdmin, handleAsync(async (req, res) => {
    const [[review]] = await pool.query('SELECT provider_id FROM ratings WHERE id = ?', [req.params.id]);
    if (!review) return res.status(404).json({ success: false, error: 'Review not found' });
    await pool.execute("UPDATE ratings SET status = 'approved' WHERE id = ?", [req.params.id]);
    const [[{ avg }]] = await pool.query(
        "SELECT ROUND(AVG(stars), 1) AS avg FROM ratings WHERE provider_id = ? AND status = 'approved'",
        [review.provider_id]
    );
    await pool.execute('UPDATE users SET rating = ? WHERE id = ?', [avg || 0, review.provider_id]);
    res.json({ success: true, newAverage: avg });
}));

// ── PUT /api/admin/reviews/:id/reject ─────────────────────────────────────────
app.put('/api/admin/reviews/:id/reject', requireAdmin, handleAsync(async (req, res) => {
    const [[review]] = await pool.query('SELECT provider_id FROM ratings WHERE id = ?', [req.params.id]);
    if (!review) return res.status(404).json({ success: false, error: 'Review not found' });
    await pool.execute("UPDATE ratings SET status = 'rejected' WHERE id = ?", [req.params.id]);
    const [[{ avg }]] = await pool.query(
        "SELECT ROUND(AVG(stars), 1) AS avg FROM ratings WHERE provider_id = ? AND status = 'approved'",
        [review.provider_id]
    );
    await pool.execute('UPDATE users SET rating = ? WHERE id = ?', [avg || 0, review.provider_id]);
    res.json({ success: true, newAverage: avg });
}));

// ── DELETE /api/admin/reviews/:id ─────────────────────────────────────────────
app.delete('/api/admin/reviews/:id', requireAdmin, handleAsync(async (req, res) => {
    const [[review]] = await pool.query('SELECT provider_id FROM ratings WHERE id = ?', [req.params.id]);
    if (!review) return res.status(404).json({ success: false, error: 'Review not found' });
    await pool.execute('DELETE FROM ratings WHERE id = ?', [req.params.id]);
    const [[{ avg }]] = await pool.query(
        "SELECT ROUND(AVG(stars), 1) AS avg FROM ratings WHERE provider_id = ? AND status = 'approved'",
        [review.provider_id]
    );
    await pool.execute('UPDATE users SET rating = ? WHERE id = ?', [avg || 0, review.provider_id]);
    res.json({ success: true });
}));

// ── GET /api/stats ────────────────────────────────────────────────────────────
app.get('/api/stats', handleAsync(async (req, res) => {
    const [[{ totalUsers }]]       = await pool.query("SELECT COUNT(*) AS totalUsers FROM users");
    const [[{ totalBookings }]]    = await pool.query("SELECT COUNT(*) AS totalBookings FROM bookings");
    const [[{ pendingInquiries }]] = await pool.query("SELECT COUNT(*) AS pendingInquiries FROM bookings WHERE status = 'pending'");
    const [[{ adClicks }]]         = await pool.query("SELECT COUNT(*) AS adClicks FROM bookings WHERE status = 'completed'");
    const [[{ avgRating }]]        = await pool.query("SELECT ROUND(AVG(stars), 1) AS avgRating FROM ratings WHERE status = 'approved'");

    // Engagement data: bookings per month for the last 6 months
    const [engRows] = await pool.query(`
        SELECT DATE_FORMAT(MIN(created_at), '%b') AS month, COUNT(*) AS value
        FROM bookings
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
        GROUP BY DATE_FORMAT(created_at, '%Y-%m')
        ORDER BY DATE_FORMAT(created_at, '%Y-%m') ASC
    `);

    // Category data: providers per service category
    const [catRows] = await pool.query(`
        SELECT service_categories AS name, COUNT(*) AS value
        FROM users
        WHERE service_categories IS NOT NULL AND service_categories != '' AND service_categories != 'None'
        GROUP BY service_categories
        ORDER BY COUNT(*) DESC
        LIMIT 5
    `);

    res.json({
        totalUsers,
        adImpressions: totalBookings,
        adClicks,
        pendingInquiries,
        averageRating: parseFloat(avgRating) || 5.0,
        engagementData: engRows.length ? engRows : [
            { month: 'Jan', value: 0 }, { month: 'Feb', value: 0 }, { month: 'Mar', value: 0 }
        ],
        categoryData: catRows.length ? catRows : [{ name: 'General', value: 1 }]
    });
}));

// ── GET /api/bookings (admin) ─────────────────────────────────────────────────
app.get('/api/bookings', requireAdmin, handleAsync(async (req, res) => {
    const [rows] = await pool.query(
        `SELECT b.*,
                c.name AS customer_name, c.avatar AS customer_avatar,
                p.name AS provider_name, p.avatar AS provider_avatar
         FROM bookings b
         LEFT JOIN users c ON c.id = b.customer_id
         LEFT JOIN users p ON p.id = b.provider_id
         ORDER BY b.created_at DESC`
    );
    res.json(rows);
}));

// ── PUT /api/users/:id/status ─────────────────────────────────────────────────
app.put('/api/users/:id/status', handleAsync(async (req, res) => {
    const { status } = req.body;
    if (!status) return res.status(400).json({ success: false, error: 'status is required' });
    await pool.execute('UPDATE users SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ success: true });
}));

// ── PUT /api/users/:id/approve ────────────────────────────────────────────────
app.put('/api/users/:id/approve', handleAsync(async (req, res) => {
    await pool.execute("UPDATE users SET status = 'Active' WHERE id = ?", [req.params.id]);
    res.json({ success: true });
}));

// ── PUT /api/users/:id/onboard ────────────────────────────────────────────────
app.put('/api/users/:id/onboard', handleAsync(async (req, res) => {
    const { name, role, bio } = req.body;
    const newStatus = role === 'Provider' ? 'Pending Approval' : 'Active';
    await pool.execute(
        'UPDATE users SET name = ?, role = ?, bio = ?, onboarded = 1, status = ? WHERE id = ?',
        [name || null, role || 'Customer', bio || null, newStatus, req.params.id]
    );
    res.json({ success: true, status: newStatus });
}));

// ── PUT /api/users/:id/profile ────────────────────────────────────────────────
app.put('/api/users/:id/profile', handleAsync(async (req, res) => {
    const { name, bio, avatar } = req.body;
    await pool.execute(
        'UPDATE users SET name = ?, bio = ?, avatar = ? WHERE id = ?',
        [name || null, bio || null, avatar || null, req.params.id]
    );
    res.json({ success: true });
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
    const [rows] = await pool.query('SELECT * FROM services ORDER BY category ASC, name ASC');
    res.json(rows);
}));

app.post('/api/services', handleAsync(async (req, res) => {
    const { id, name, category, icon, description, status } = req.body;
    if (!name || !category) {
        return res.status(400).json({ success: false, error: 'name and category are required' });
    }
    const serviceId = id || 'S' + Date.now();
    await pool.execute(
        'INSERT INTO services (id, name, category, icon, description, status) VALUES (?, ?, ?, ?, ?, ?)',
        [serviceId, name, category, icon || '📦', description || '', status || 'Active']
    );
    res.json({ success: true, id: serviceId });
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

// ── DIRECT MESSAGING ROUTES ──────────────────────────────────────────────────

// GET /api/conversations/:userId — list all conversations for a user
app.get('/api/conversations/:userId', handleAsync(async (req, res) => {
    const userId = req.params.userId;
    const [rows] = await pool.query(
        `SELECT c.*,
                u1.name AS p1_name, u1.avatar AS p1_avatar,
                u2.name AS p2_name, u2.avatar AS p2_avatar,
                (SELECT COUNT(*) FROM direct_messages dm
                 WHERE dm.conversation_id = c.id AND dm.sender_id != ? AND dm.is_read = 0) AS unread_count
         FROM conversations c
         LEFT JOIN users u1 ON u1.id = c.participant_1
         LEFT JOIN users u2 ON u2.id = c.participant_2
         WHERE c.participant_1 = ? OR c.participant_2 = ?
         ORDER BY c.last_message_at DESC`,
        [userId, userId, userId]
    );

    const conversations = rows.map(c => {
        const isP1 = c.participant_1 === userId;
        const otherAvatar = isP1 ? c.p2_avatar : c.p1_avatar;
        return {
            id: c.id,
            other_id: isP1 ? c.participant_2 : c.participant_1,
            other_name: isP1 ? c.p2_name : c.p1_name,
            other_avatar: otherAvatar && otherAvatar.startsWith('/uploads/') ? `http://localhost:3000${otherAvatar}` : (otherAvatar || ''),
            last_message: c.last_message,
            last_message_at: c.last_message_at,
            unread_count: c.unread_count
        };
    });

    const totalUnread = conversations.reduce((sum, c) => sum + c.unread_count, 0);
    res.json({ success: true, conversations, totalUnread });
}));

// POST /api/conversations — create or find existing conversation
app.post('/api/conversations', handleAsync(async (req, res) => {
    const { user1_id, user2_id } = req.body;
    if (!user1_id || !user2_id) return res.status(400).json({ success: false, error: 'user1_id and user2_id required' });

    // Check if conversation already exists
    const [existing] = await pool.query(
        `SELECT * FROM conversations
         WHERE (participant_1 = ? AND participant_2 = ?) OR (participant_1 = ? AND participant_2 = ?)`,
        [user1_id, user2_id, user2_id, user1_id]
    );

    if (existing.length > 0) {
        return res.json({ success: true, conversation: existing[0], created: false });
    }

    const id = 'CONV' + Date.now();
    await pool.execute(
        'INSERT INTO conversations (id, participant_1, participant_2) VALUES (?, ?, ?)',
        [id, user1_id, user2_id]
    );
    const [[conv]] = await pool.query('SELECT * FROM conversations WHERE id = ?', [id]);
    res.json({ success: true, conversation: conv, created: true });
}));

// GET /api/messages/:conversationId — fetch messages for a conversation
app.get('/api/messages/:conversationId', handleAsync(async (req, res) => {
    const [rows] = await pool.query(
        `SELECT dm.*, u.name AS sender_name, u.avatar AS sender_avatar
         FROM direct_messages dm
         LEFT JOIN users u ON u.id = dm.sender_id
         WHERE dm.conversation_id = ?
         ORDER BY dm.created_at ASC
         LIMIT 100`,
        [req.params.conversationId]
    );
    res.json({ success: true, messages: rows });
}));

// POST /api/messages — send a direct message
app.post('/api/messages', handleAsync(async (req, res) => {
    const { conversation_id, sender_id, content } = req.body;
    if (!conversation_id || !sender_id || !content) {
        return res.status(400).json({ success: false, error: 'conversation_id, sender_id, and content required' });
    }

    const id = 'DM' + Date.now() + Math.random().toString(36).slice(2, 6);
    await pool.execute(
        'INSERT INTO direct_messages (id, conversation_id, sender_id, content) VALUES (?, ?, ?, ?)',
        [id, conversation_id, sender_id, content]
    );

    // Update conversation last_message
    await pool.execute(
        'UPDATE conversations SET last_message = ?, last_message_at = NOW() WHERE id = ?',
        [content.substring(0, 200), conversation_id]
    );

    // Find recipient and create notification
    const [[conv]] = await pool.query('SELECT * FROM conversations WHERE id = ?', [conversation_id]);
    if (conv) {
        const recipientId = conv.participant_1 === sender_id ? conv.participant_2 : conv.participant_1;
        const [[sender]] = await pool.query('SELECT name FROM users WHERE id = ?', [sender_id]);
        const senderName = sender ? sender.name : 'Someone';
        await pool.execute(
            'INSERT INTO notifications (user_id, type, title, message) VALUES (?, ?, ?, ?)',
            [recipientId, 'direct_message', `💬 ${senderName}`, content.substring(0, 100)]
        );
    }

    res.json({ success: true, messageId: id });
}));

// PUT /api/messages/:conversationId/read — mark messages as read
app.put('/api/messages/:conversationId/read', handleAsync(async (req, res) => {
    const { user_id } = req.body;
    if (!user_id) return res.status(400).json({ success: false, error: 'user_id required' });
    await pool.execute(
        'UPDATE direct_messages SET is_read = 1 WHERE conversation_id = ? AND sender_id != ? AND is_read = 0',
        [req.params.conversationId, user_id]
    );
    res.json({ success: true });
}));

// GET /api/messages/unread-count/:userId — total unread DM count
app.get('/api/messages/unread-count/:userId', handleAsync(async (req, res) => {
    const userId = req.params.userId;
    const [[{ count }]] = await pool.query(
        `SELECT COUNT(*) AS count FROM direct_messages dm
         JOIN conversations c ON c.id = dm.conversation_id
         WHERE (c.participant_1 = ? OR c.participant_2 = ?)
           AND dm.sender_id != ? AND dm.is_read = 0`,
        [userId, userId, userId]
    );
    res.json({ success: true, count });
}));

// ── POST A TASK ROUTES ──────────────────────────────────────────────────────

// POST /api/tasks — create a task
app.post('/api/tasks', handleAsync(async (req, res) => {
    const { poster_id, title, description, category, budget, task_date, location, lat, lng } = req.body;
    if (!poster_id || !title || !category) {
        return res.status(400).json({ success: false, error: 'poster_id, title, and category are required' });
    }

    const id = 'T' + Date.now();
    await pool.execute(
        'INSERT INTO tasks (id, poster_id, title, description, category, budget, task_date, location, lat, lng) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [id, poster_id, title, description || null, category, budget || null, task_date || null, location || null, lat || null, lng || null]
    );
    res.json({ success: true, taskId: id });
}));

// GET /api/tasks — list tasks
app.get('/api/tasks', handleAsync(async (req, res) => {
    const { category, status, poster_id, search } = req.query;
    let sql = `SELECT t.*, u.name AS poster_name, u.avatar AS poster_avatar,
                      (SELECT COUNT(*) FROM task_applications ta WHERE ta.task_id = t.id) AS application_count
               FROM tasks t
               LEFT JOIN users u ON u.id = t.poster_id
               WHERE 1=1`;
    const params = [];

    if (category) { sql += ' AND t.category = ?'; params.push(category); }
    if (status) { sql += ' AND t.status = ?'; params.push(status); }
    if (poster_id) { sql += ' AND t.poster_id = ?'; params.push(poster_id); }
    if (search) { sql += ' AND (t.title LIKE ? OR t.description LIKE ? OR t.location LIKE ?)'; params.push(`%${search}%`, `%${search}%`, `%${search}%`); }

    sql += ' ORDER BY t.created_at DESC LIMIT 50';
    const [rows] = await pool.query(sql, params);

    const tasks = rows.map(t => ({
        ...t,
        poster_avatar: t.poster_avatar && t.poster_avatar.startsWith('/uploads/') ? `http://localhost:3000${t.poster_avatar}` : (t.poster_avatar || '')
    }));

    res.json({ success: true, tasks });
}));

// GET /api/tasks/:id — task detail with applications
app.get('/api/tasks/:id', handleAsync(async (req, res) => {
    const [[task]] = await pool.query(
        `SELECT t.*, u.name AS poster_name, u.avatar AS poster_avatar
         FROM tasks t LEFT JOIN users u ON u.id = t.poster_id WHERE t.id = ?`,
        [req.params.id]
    );
    if (!task) return res.status(404).json({ success: false, error: 'Task not found' });

    const [applications] = await pool.query(
        `SELECT ta.*, u.name AS provider_name, u.avatar AS provider_avatar, u.rating AS provider_rating
         FROM task_applications ta LEFT JOIN users u ON u.id = ta.provider_id
         WHERE ta.task_id = ? ORDER BY ta.created_at DESC`,
        [req.params.id]
    );

    task.poster_avatar = task.poster_avatar && task.poster_avatar.startsWith('/uploads/') ? `http://localhost:3000${task.poster_avatar}` : (task.poster_avatar || '');
    applications.forEach(a => {
        a.provider_avatar = a.provider_avatar && a.provider_avatar.startsWith('/uploads/') ? `http://localhost:3000${a.provider_avatar}` : (a.provider_avatar || '');
    });

    res.json({ success: true, task, applications });
}));

// POST /api/tasks/:id/apply — provider applies to a task
app.post('/api/tasks/:id/apply', handleAsync(async (req, res) => {
    const { provider_id, message } = req.body;
    if (!provider_id) return res.status(400).json({ success: false, error: 'provider_id required' });

    // Check for duplicate application
    const [dup] = await pool.query(
        'SELECT id FROM task_applications WHERE task_id = ? AND provider_id = ?',
        [req.params.id, provider_id]
    );
    if (dup.length > 0) return res.status(400).json({ success: false, error: 'Already applied to this task' });

    const id = 'TA' + Date.now();
    await pool.execute(
        'INSERT INTO task_applications (id, task_id, provider_id, message) VALUES (?, ?, ?, ?)',
        [id, req.params.id, provider_id, message || null]
    );

    // Notify task poster
    const [[task]] = await pool.query('SELECT poster_id, title FROM tasks WHERE id = ?', [req.params.id]);
    const [[provider]] = await pool.query('SELECT name FROM users WHERE id = ?', [provider_id]);
    if (task) {
        await pool.execute(
            'INSERT INTO notifications (user_id, type, title, message) VALUES (?, ?, ?, ?)',
            [task.poster_id, 'task_application', `📋 New applicant for "${task.title}"`, `${provider?.name || 'Someone'} wants to help with your task.`]
        );
    }

    res.json({ success: true, applicationId: id });
}));

// PUT /api/tasks/:id/assign — assign a provider to a task
app.put('/api/tasks/:id/assign', handleAsync(async (req, res) => {
    const { provider_id } = req.body;
    if (!provider_id) return res.status(400).json({ success: false, error: 'provider_id required' });

    await pool.execute(
        'UPDATE tasks SET assigned_provider_id = ?, status = ? WHERE id = ?',
        [provider_id, 'assigned', req.params.id]
    );

    // Update application status
    await pool.execute(
        'UPDATE task_applications SET status = ? WHERE task_id = ? AND provider_id = ?',
        ['accepted', req.params.id, provider_id]
    );
    // Reject other applications
    await pool.execute(
        'UPDATE task_applications SET status = ? WHERE task_id = ? AND provider_id != ?',
        ['rejected', req.params.id, provider_id]
    );

    // Notify provider
    const [[task]] = await pool.query('SELECT title FROM tasks WHERE id = ?', [req.params.id]);
    await pool.execute(
        'INSERT INTO notifications (user_id, type, title, message) VALUES (?, ?, ?, ?)',
        [provider_id, 'task_assigned', `✅ You've been assigned!`, `You were selected for the task "${task?.title || ''}".`]
    );

    res.json({ success: true });
}));

// PUT /api/tasks/:id/status — update task status
app.put('/api/tasks/:id/status', handleAsync(async (req, res) => {
    const { status } = req.body;
    if (!['open', 'assigned', 'completed'].includes(status)) {
        return res.status(400).json({ success: false, error: 'Invalid status' });
    }
    await pool.execute('UPDATE tasks SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ success: true });
}));

// DELETE /api/tasks/:id — delete a task (poster only)
app.delete('/api/tasks/:id', handleAsync(async (req, res) => {
    const { user_id } = req.body;
    if (!user_id) return res.status(400).json({ success: false, error: 'user_id required' });

    const [[task]] = await pool.query('SELECT poster_id FROM tasks WHERE id = ?', [req.params.id]);
    if (!task) return res.status(404).json({ success: false, error: 'Task not found' });
    if (task.poster_id !== user_id) return res.status(403).json({ success: false, error: 'Only the poster can delete this task' });

    await pool.execute('DELETE FROM task_applications WHERE task_id = ?', [req.params.id]);
    await pool.execute('DELETE FROM tasks WHERE id = ?', [req.params.id]);
    res.json({ success: true });
}));

// ─── Email transporter helper ─────────────────────────────────────────────────
// When USE_ETHEREAL=true, auto-creates a free Ethereal test account.
// After sending, call nodemailer.getTestMessageUrl(info) for a preview link.
async function createMailTransporter() {
    if (process.env.USE_ETHEREAL === 'true') {
        const testAccount = await nodemailer.createTestAccount();
        const transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: { user: testAccount.user, pass: testAccount.pass }
        });
        return { transporter, isEthereal: true };
    }
    const host = process.env.SMTP_HOST || 'smtp.gmail.com';
    const transporter = nodemailer.createTransport({
        host,
        port:   parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    });
    return { transporter, isEthereal: host.includes('ethereal.email') };
}

// ─── Token helpers ────────────────────────────────────────────────────────────
function issueAccessToken(user) {
    return jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '15m' });
}

async function issueRefreshToken(user) {
    const token = jwt.sign({ userId: user.id }, REFRESH_SECRET, { expiresIn: '60d' });
    const tokenHash = require('crypto').createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);
    await pool.execute(
        'INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)',
        [user.id, tokenHash, expiresAt]
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

    // Send email via nodemailer
    const { transporter, isEthereal } = await createMailTransporter();

    try {
        const info = await transporter.sendMail({
            from: process.env.SMTP_FROM || `"HelpHub" <noreply@helphub.local>`,
            to: email,
            subject: 'Your HelpHub verification code',
            html: `
                <div style="font-family:sans-serif;max-width:400px;margin:auto">
                    <h2 style="color:#f97316">HelpHub</h2>
                    <p>Your one-time verification code is:</p>
                    <h1 style="letter-spacing:8px;color:#111">${otp}</h1>
                    <p style="color:#666;font-size:13px">This code expires in 10 minutes. If you didn't request this, ignore this email.</p>
                </div>
            `
        });
        if (isEthereal) {
            const previewUrl = nodemailer.getTestMessageUrl(info);
            console.log(`\n📧 OTP email preview (Ethereal): ${previewUrl}\n`);
            return res.json({ success: true, message: 'Verification code sent', previewUrl });
        }
        console.log(`OTP sent to ${email}`);
    } catch (err) {
        console.error('Failed to send OTP email:', err.message);
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

// ─── POST /api/auth/send-magic-link ──────────────────────────────────────────
app.post('/api/auth/send-magic-link', authLimiter, handleAsync(async (req, res) => {
    if (!pool) throw new Error("Database pool not ready");
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, error: 'email is required' });

    const crypto = require('crypto');
    const rawToken   = crypto.randomBytes(32).toString('hex');
    const tokenHash  = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt  = new Date(Date.now() + 15 * 60 * 1000); // 15 min

    // Remove any existing tokens for this email (one active link at a time)
    await pool.execute('DELETE FROM magic_link_tokens WHERE email = ?', [email]);
    await pool.execute(
        'INSERT INTO magic_link_tokens (token_hash, email, expires_at) VALUES (?, ?, ?)',
        [tokenHash, email, expiresAt]
    );

    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3000';
    const magicUrl   = `${backendUrl}/api/auth/magic?token=${rawToken}`;

    const { transporter, isEthereal } = await createMailTransporter();

    try {
        const info = await transporter.sendMail({
            from:    process.env.SMTP_FROM || `"HelpHub" <noreply@helphub.local>`,
            to:      email,
            subject: 'Sign in to HelpHub',
            html: `
                <div style="font-family:sans-serif;max-width:420px;margin:auto">
                    <h2 style="color:#f97316">HelpHub</h2>
                    <p>Click the button below to sign in. This link expires in <strong>15 minutes</strong> and can only be used once.</p>
                    <a href="${magicUrl}" style="display:inline-block;padding:12px 28px;background:#f97316;color:#fff;border-radius:8px;text-decoration:none;font-weight:bold;font-size:16px;margin:16px 0">
                        Sign in to HelpHub
                    </a>
                    <p style="color:#888;font-size:12px">If you didn't request this, you can safely ignore this email.</p>
                </div>
            `
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

    return res.json({ success: true, message: 'Sign-in link sent — check your inbox.' });
}));

// ─── GET /api/auth/magic ──────────────────────────────────────────────────────
app.get('/api/auth/magic', authLimiter, handleAsync(async (req, res) => {
    if (!pool) throw new Error("Database pool not ready");
    const { token } = req.query;
    if (!token) return res.status(400).send('Missing token.');

    const crypto    = require('crypto');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const [[record]] = await pool.query(
        'SELECT * FROM magic_link_tokens WHERE token_hash = ?', [tokenHash]
    );

    if (!record) {
        return res.status(400).send(`
            <html><body style="font-family:sans-serif;text-align:center;padding:40px">
            <h2 style="color:#f97316">HelpHub</h2>
            <p>This sign-in link is invalid or has already been used.</p>
            <p><a href="http://localhost:8080">Request a new link</a></p>
            </body></html>
        `);
    }

    if (new Date() > new Date(record.expires_at)) {
        await pool.execute('DELETE FROM magic_link_tokens WHERE token_hash = ?', [tokenHash]);
        return res.status(400).send(`
            <html><body style="font-family:sans-serif;text-align:center;padding:40px">
            <h2 style="color:#f97316">HelpHub</h2>
            <p>This sign-in link has expired. Links are valid for 15 minutes.</p>
            <p><a href="http://localhost:8080">Request a new link</a></p>
            </body></html>
        `);
    }

    // One-time use — delete immediately
    await pool.execute('DELETE FROM magic_link_tokens WHERE token_hash = ?', [tokenHash]);

    // Find or create user
    const email = record.email;
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    let user;
    if (users.length > 0) {
        user = users[0];
    } else {
        const id     = 'U' + Date.now();
        const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}`;
        await pool.execute(
            'INSERT INTO users (id, name, email, role, status, avatar, onboarded, provider) VALUES (?, ?, ?, "Customer", "Active", ?, 1, "Email")',
            [id, email.split('@')[0], email, avatar]
        );
        const [newUser] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
        user = newUser[0];
    }

    const { accessToken, refreshToken } = await issueTokens(user);

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8080';
    return res.redirect(`${frontendUrl}/?accessToken=${encodeURIComponent(accessToken)}&refreshToken=${encodeURIComponent(refreshToken)}`);
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
app.post('/api/auth/refresh', authLimiter, handleAsync(async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ success: false, error: 'refreshToken is required' });

    let payload;
    try {
        payload = jwt.verify(refreshToken, REFRESH_SECRET);
    } catch {
        return res.status(401).json({ success: false, error: 'Invalid or expired refresh token' });
    }

    const tokenHash = require('crypto').createHash('sha256').update(refreshToken).digest('hex');
    const [rows] = await pool.query(
        'SELECT * FROM refresh_tokens WHERE user_id = ? AND token_hash = ? AND expires_at > NOW()',
        [payload.userId, tokenHash]
    );
    if (rows.length === 0) return res.status(401).json({ success: false, error: 'Refresh token revoked or expired' });

    const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [payload.userId]);
    if (users.length === 0) return res.status(401).json({ success: false, error: 'User not found' });

    // Block suspended/banned users from refreshing
    if (users[0].status !== 'Active') return res.status(401).json({ success: false, error: 'Account suspended' });

    const accessToken = issueAccessToken(users[0]);
    res.json({ success: true, accessToken });
}));

// ─── POST /api/auth/logout ────────────────────────────────────────────────────
app.post('/api/auth/logout', handleAsync(async (req, res) => {
    const { refreshToken } = req.body;
    if (refreshToken) {
        const tokenHash = require('crypto').createHash('sha256').update(refreshToken).digest('hex');
        await pool.execute('DELETE FROM refresh_tokens WHERE token_hash = ?', [tokenHash]);
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
