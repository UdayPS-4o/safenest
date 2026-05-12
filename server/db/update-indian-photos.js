/**
 * Fetches real Indian-nationality portraits from randomuser.me API
 * and updates all user profile photos in the database.
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const https = require('https');
const { db } = require('../db');
const { users } = require('./schema.mysql');
const { eq } = require('drizzle-orm');

function fetchIndianPortraits(count) {
  return new Promise((resolve, reject) => {
    const url = `https://randomuser.me/api/?results=${count}&nat=in&inc=picture,gender`;
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed.results.map(u => ({ url: u.picture.large, gender: u.gender })));
        } catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

async function updatePhotos() {
  console.log('🌐 Fetching Indian portraits from randomuser.me...');
  const portraits = await fetchIndianPortraits(30); // fetch 30 to have enough

  const men    = portraits.filter(p => p.gender === 'male').map(p => p.url);
  const women  = portraits.filter(p => p.gender === 'female').map(p => p.url);

  console.log(`   Got ${men.length} male + ${women.length} female Indian portraits\n`);

  // Map phone → gender to pick correct portrait
  const userMap = [
    { phone: '+919876543211', gender: 'male' },   // Arjun Sharma
    { phone: '+919800011111', gender: 'female' },  // Priya Menon
    { phone: '+919800022222', gender: 'male' },    // Vikram Patel
    { phone: '+919800033333', gender: 'female' },  // Ananya Krishnan
    { phone: '+919876543212', gender: 'male' },    // Ramesh Singh (guard)
    { phone: '+919800044444', gender: 'male' },    // Suresh Yadav (guard)
    { phone: '+919876543213', gender: 'female' },  // Meena Kumari
    { phone: '+919800055551', gender: 'female' },  // Kavita Sharma
    { phone: '+919876543210', gender: 'male' },    // Ramesh Kumar
    { phone: '+919800055552', gender: 'female' },  // Lakshmi Bai
    { phone: '+919800055553', gender: 'male' },    // Mohan Das
    { phone: '+919800055554', gender: 'female' },  // Geeta Devi
    { phone: '+919800055555', gender: 'male' },    // Rajesh Patel
    { phone: '+919800055556', gender: 'female' },  // Anita Singh
    { phone: '+919876543214', gender: 'male' },    // Rajan Mehta (admin)
    { phone: '+919876543215', gender: 'male' },    // Rahul Kumar (delivery)
    { phone: '+919900001111', gender: 'female' },  // Priya Nair (pending)
    { phone: '+919900002222', gender: 'male' },    // Vijay Patil (pending)
  ];

  let mi = 0, fi = 0;
  for (const entry of userMap) {
    const photo = entry.gender === 'male' ? men[mi++ % men.length] : women[fi++ % women.length];
    await db.update(users).set({ profilePhotoUrl: photo }).where(eq(users.phoneNumber, entry.phone));
    console.log(`✅ ${entry.phone} → ${photo}`);
  }

  console.log('\n🎉 All photos updated to Indian portraits!\n');
  process.exit(0);
}

updatePhotos().catch(e => { console.error('❌', e.message); process.exit(1); });
