require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const path = require('path');

// Always MySQL now — Cloud Run production
const mysql = require('mysql2/promise');
const { drizzle } = require('drizzle-orm/mysql2');
const schema = require('./schema.mysql');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const db = drizzle(pool, { schema, mode: 'default' });

console.log('[DB] MySQL pool created →', process.env.DB_HOST, '/', process.env.DB_NAME);

module.exports = { db, schema, pool };
