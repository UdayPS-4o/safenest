require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { db } = require('../db');
const { users } = require('./schema.mysql');
const { eq } = require('drizzle-orm');

async function updateSpecificIndianPhotos() {
  console.log('🌐 Updating users with curated rural/authentic Indian Unsplash photos...');

  // Map phone → specific Unsplash photo to ensure no repeats and right vibe
  const userMap = [
    // --- Residents (Urban but distinctly Indian) ---
    { phone: '+919876543211', photo: 'https://images.unsplash.com/photo-1615813967515-e1838c1c56dd?w=400&q=80' },   // Arjun Sharma
    { phone: '+919800011111', photo: 'https://images.unsplash.com/photo-1589419107936-ce47e923e512?w=400&q=80' },  // Priya Menon
    { phone: '+919800022222', photo: 'https://images.unsplash.com/photo-1555519822-4416972412b9?w=400&q=80' },    // Vikram Patel
    { phone: '+919800033333', photo: 'https://images.unsplash.com/photo-1506894008272-38d17b409dd6?w=400&q=80' },  // Ananya Krishnan
    
    // --- Guards (Working class Indian men) ---
    { phone: '+919876543212', photo: 'https://images.unsplash.com/photo-1580227774780-c116c5188fb8?w=400&q=80' },    // Ramesh Singh
    { phone: '+919800044444', photo: 'https://images.unsplash.com/photo-1618670868840-7e3e4a30e84c?w=400&q=80' },    // Suresh Yadav
    
    // --- Helpers (Rural/Working class Indian vibe) ---
    { phone: '+919876543213', photo: 'https://images.unsplash.com/photo-1595152452543-e5fc28ebc2b8?w=400&q=80' },  // Meena Kumari / Sunita Devi
    { phone: '+919800055551', photo: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400&q=80' },  // Kavita Sharma
    { phone: '+919876543210', photo: 'https://images.unsplash.com/photo-1533069152285-d8b52f1eec36?w=400&q=80' },    // Ramesh Kumar
    { phone: '+919800055552', photo: 'https://images.unsplash.com/photo-1583500293121-6d7cf61605f8?w=400&q=80' },  // Lakshmi Bai
    { phone: '+919800055553', photo: 'https://images.unsplash.com/photo-1516008628005-cb9bb3db7b0a?w=400&q=80' },    // Mohan Das
    { phone: '+919800055554', photo: 'https://images.unsplash.com/photo-1517409241517-f5da1daff4f4?w=400&q=80' },  // Geeta Devi
    { phone: '+919800055555', photo: 'https://images.unsplash.com/photo-1502409029705-ebcf858d4076?w=400&q=80' },    // Rajesh Patel
    { phone: '+919800055556', photo: 'https://images.unsplash.com/photo-1615179538356-94676101962d?w=400&q=80' },  // Anita Singh
    
    // --- Admin ---
    { phone: '+919876543214', photo: 'https://images.unsplash.com/photo-1520630650953-294b30e42d7f?w=400&q=80' },    // Rajan Mehta
    
    // --- Delivery ---
    { phone: '+919876543215', photo: 'https://images.unsplash.com/photo-1550927877-c91f63dcad1a?w=400&q=80' },    // Rahul Kumar
    
    // --- Pending Users ---
    { phone: '+919900001111', photo: 'https://images.unsplash.com/photo-1583391265691-03099ac52528?w=400&q=80' },  // Priya Nair
    { phone: '+919900002222', photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80' },    // Vijay Patil
  ];

  let count = 0;
  for (const entry of userMap) {
    try {
      await db.update(users).set({ profilePhotoUrl: entry.photo }).where(eq(users.phoneNumber, entry.phone));
      console.log(`✅ Updated ${entry.phone}`);
      count++;
    } catch (e) {
      console.log(`⚠️ Failed to update ${entry.phone}: ${e.message}`);
    }
  }

  console.log(`\n🎉 Updated ${count} users with curated Indian photos!\n`);
  process.exit(0);
}

updateSpecificIndianPhotos().catch(e => { console.error('❌', e.message); process.exit(1); });
