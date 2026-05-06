
require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });
const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
const path    = require('path');
const fs      = require('fs');

const ALLOWED_ORIGINS = (process.env.CORS_ORIGIN || 'http://localhost:8080')
    .split(',')
    .map(o => o.trim());

// ── Firebase Admin init ───────────────────────────────────────────────────────
const admin = require('firebase-admin');
if (!admin.apps.length) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId:   process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey:  (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
            }),
        });
        console.log('🔔 Firebase Admin initialised');
    } catch (e) {
        console.warn('⚠️  Firebase Admin init skipped:', e.message);
    }
}

// ── Uploads directory ─────────────────────────────────────────────────────────
const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const app = express();

app.use(helmet());
// Allow /uploads images to be loaded cross-origin (helmet v4 doesn't have CORP built-in)
app.use('/uploads', (req, res, next) => { res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin'); next(); });

app.use(cors({
    origin: function(origin, callback) {
        // allow server-to-server (no origin) and whitelisted origins
        if (!origin || ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
        callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id', 'x-admin-token']
}));

app.use(express.json());
app.use('/uploads', express.static(UPLOADS_DIR));

const pool = require('./db/pool');

// ── Database bootstrap ────────────────────────────────────────────────────────
async function initDb() {
    try {
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
            { name: 'lng',                type: 'FLOAT' },
            { name: 'terms_accepted_at',  type: 'DATETIME NULL' },
            { name: 'terms_version',      type: 'VARCHAR(10) NULL' },
            { name: 'trust_level',        type: "ENUM('new_user','verified_user','trusted_user') DEFAULT 'new_user'" },
            { name: 'trust_score',        type: 'DECIMAL(5,2) DEFAULT 0' },
            { name: 'risk_score',         type: 'DECIMAL(5,2) DEFAULT 0' }
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

        // Seed default services on every restart (INSERT IGNORE preserves admin edits)
        const defaultServices = [
            ['S1',  'Cleaning',     'Home',      '🧹', 'Home and office cleaning by vetted professionals.'],
            ['S2',  'Gardening',    'Home',      '🌱', 'Lawn care, planting, and garden maintenance.'],
            ['S3',  'Handyman',     'Home',      '🔧', 'General home repairs and installations.'],
            ['S4',  'Babysitting',  'Care',      '👶', 'Trusted childcare in your own home.'],
            ['S5',  'Elder Care',   'Care',      '🧓', 'Companionship, light assistance, and care for elderly.'],
            ['S6',  'Pet Care',     'Care',      '🐕', 'Dog walking, pet sitting, and grooming.'],
            ['S7',  'Transport',    'Transport', '🚗', 'Reliable rides for errands, events, and daily travel.'],
            ['S8',  'Groceries',    'Transport', '🛒', 'Grocery shopping and delivery to your door.'],
            ['S9',  'Cooking',      'Wellness',  '👨‍🍳', 'Home-cooked meals prepared fresh by local chefs.'],
            ['S10', 'Massage',      'Wellness',  '💆', 'Professional home massage for relaxation and recovery.'],
            ['S11', 'Math Tuition', 'Skills',    '📐', 'One-on-one math lessons for all ages and levels.'],
            ['S12', 'IT Support',   'Skills',    '💻', 'Tech help, device setup, and troubleshooting.'],
        ];
        await connection.query(`DELETE FROM services WHERE id IN ('S13','S14','S15')`);
        for (const [id, name, category, icon, description] of defaultServices) {
            await connection.query(
                'INSERT IGNORE INTO services (id, name, category, icon, description, status) VALUES (?, ?, ?, ?, ?, ?)',
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
        try { await connection.query('ALTER TABLE tasks ADD COLUMN lat FLOAT'); } catch(e) {}
        try { await connection.query('ALTER TABLE tasks ADD COLUMN lng FLOAT'); } catch(e) {}


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

        await connection.query(`
            CREATE TABLE IF NOT EXISTS user_blocks (
                id INT AUTO_INCREMENT PRIMARY KEY,
                blocker_id VARCHAR(50) NOT NULL,
                blocked_id VARCHAR(50) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE KEY uq_block (blocker_id, blocked_id),
                INDEX idx_blocker (blocker_id),
                INDEX idx_blocked (blocked_id)
            )
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS reports (
                id INT AUTO_INCREMENT PRIMARY KEY,
                reporter_id VARCHAR(50) NOT NULL,
                reported_type ENUM('user','post','message') NOT NULL,
                reported_id VARCHAR(50) NOT NULL,
                category ENUM('spam','harassment','scam_fraud','inappropriate_content','fake_profile','other') NOT NULL,
                description TEXT,
                status ENUM('pending','reviewed','actioned') DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_reporter (reporter_id),
                INDEX idx_reported (reported_id),
                INDEX idx_status (status)
            )
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS device_tokens (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id VARCHAR(50) NOT NULL,
                token TEXT NOT NULL,
                platform VARCHAR(20) DEFAULT 'android',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_user (user_id)
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

        const cityCoords = { 'Berlin': [52.52, 13.405], 'London': [51.5074, -0.1278] };
        for (const [city, [lat, lng]] of Object.entries(cityCoords)) {
            await connection.query(
                'UPDATE users SET lat = ?, lng = ? WHERE city = ? AND lat IS NULL',
                [lat, lng, city]
            );
        }

        // Fix stale 0-ratings caused by the old status='approved' filter bug
        await connection.query(`
            UPDATE users u
            JOIN (
                SELECT provider_id,
                       ROUND(AVG(stars), 1) AS avg
                FROM   ratings
                WHERE  status != 'rejected'
                GROUP  BY provider_id
            ) r ON r.provider_id = u.id
            SET u.rating = r.avg
            WHERE u.rating = 0 OR u.rating IS NULL
        `);

        connection.release();
        return true;
    } catch (err) {
        console.error('❌ Database Initialization Error:', err.message);
        return false;
    }
}

// ── Route mounts ──────────────────────────────────────────────────────────────
app.use('/api/users',          require('./routes/userRoutes'));
app.use('/api/providers',      require('./routes/providerRoutes'));
app.use('/api/ratings',        require('./routes/ratingRoutes'));
app.use('/api/services',       require('./routes/servicesRoutes'));
app.use('/api/bookings',       require('./routes/bookingRoutes'));
app.use('/api/notifications',  require('./routes/notificationRoutes'));
app.use('/api',                require('./routes/messageRoutes'));
app.use('/api/tasks',          require('./routes/taskRoutes'));
app.use('/api/auth',           require('./routes/authRoutes'));
app.use('/api',                require('./routes/adminRoutes'));
app.use('/api/chat',           require('./routes/chatRoutes'));

// ── Global 404 & error handler ────────────────────────────────────────────────
app.use('/api', (req, res) => {
    res.status(404).json({ success: false, error: 'Endpoint not found', path: req.originalUrl, method: req.method });
});

app.use((err, req, res, next) => {
    const status = err.status || 500;
    if (status >= 500) console.error('🔥 Server Error:', err.stack);
    res.status(status).json({ success: false, error: err.message });
});

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = 3000;

initDb().then(success => {
    if (success) {
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`🚀 ServiceLink API Gateway Online at http://localhost:${PORT}`);
        });
    } else {
        console.error('⛔ Database connection failed. Server not started.');
    }
});
