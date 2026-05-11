require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mysql = require('mysql2/promise');

// Support both Railway MySQL plugin vars (MYSQL_*) and local .env vars (DB_*)
const DB_HOST     = process.env.MYSQL_HOST     || process.env.DB_HOST;
const DB_PORT     = process.env.MYSQL_PORT     || process.env.DB_PORT     || '3306';
const DB_USER     = process.env.MYSQL_USER     || process.env.DB_USER;
const DB_PASSWORD = process.env.MYSQL_PASSWORD || process.env.DB_PASSWORD;
const DB_NAME     = process.env.MYSQL_DATABASE || process.env.DB_NAME;

if (!DB_HOST || !DB_USER || !DB_PASSWORD || !DB_NAME) {
    console.error('FATAL: Database credentials not set. Provide MYSQL_* (Railway) or DB_* (.env) vars.');
    process.exit(1);
}

const pool = mysql.createPool({
    host:             DB_HOST,
    port:             parseInt(DB_PORT),
    user:             DB_USER,
    password:         DB_PASSWORD,
    database:         DB_NAME,
    waitForConnections: true,
    connectionLimit:  10,
    queueLimit:       0,
    charset:          'utf8mb4'
});

module.exports = pool;
