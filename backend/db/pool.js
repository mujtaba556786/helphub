require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mysql = require('mysql2/promise');

if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_PASSWORD || !process.env.DB_NAME) {
    console.error('FATAL: DB_HOST, DB_USER, DB_PASSWORD and DB_NAME must be set in .env');
    process.exit(1);
}

const pool = mysql.createPool({
    host:             process.env.DB_HOST,
    port:             parseInt(process.env.DB_PORT || '3306'),
    user:             process.env.DB_USER,
    password:         process.env.DB_PASSWORD,
    database:         process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit:  10,
    queueLimit:       0,
    charset:          'utf8mb4'
});

module.exports = pool;
