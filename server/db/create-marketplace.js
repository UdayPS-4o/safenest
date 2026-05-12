const { db } = require('../db');
const { sql } = require('drizzle-orm');

async function createMarketplaceTable() {
  try {
    await db.execute(sql`CREATE TABLE IF NOT EXISTS marketplace_listings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      seller_id INT NOT NULL,
      society_id INT NOT NULL,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      type ENUM('SELL','RENT','FREE') NOT NULL,
      price INT,
      rent_period VARCHAR(50),
      category VARCHAR(100),
      image_url TEXT,
      seller_flat VARCHAR(50),
      seller_name VARCHAR(255),
      seller_phone VARCHAR(20),
      status ENUM('ACTIVE','SOLD','RENTED','CLOSED') NOT NULL DEFAULT 'ACTIVE',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (seller_id) REFERENCES users(id),
      FOREIGN KEY (society_id) REFERENCES societies(id)
    )`);
    console.log('✅ marketplace_listings table created/verified');
    process.exit(0);
  } catch (e) {
    console.error('❌ Error:', e.message);
    process.exit(1);
  }
}

createMarketplaceTable();
