require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

/** @type {import('drizzle-kit').Config} */
module.exports = {
  schema: './db/schema.mysql.js',
  out: './drizzle',
  dialect: 'mysql',
  dbCredentials: {
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'safenest',
  },
};
