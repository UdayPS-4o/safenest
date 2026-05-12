require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { db } = require('../db');
const { users } = require('./schema.mysql');
const { eq } = require('drizzle-orm');

async function updateToAvatars() {
  console.log('🔄 Converting all user photos to distinct generated avatars...');

  const allUsers = await db.select().from(users);
  let count = 0;

  for (const u of allUsers) {
    if (!u.fullName) continue;
    
    // Create a unique, distinct avatar URL based on the user's name
    // Using the popular 'lorelei' style from DiceBear API
    const seed = encodeURIComponent(u.fullName.replace(/\s+/g, ''));
    const avatarUrl = `https://api.dicebear.com/9.x/lorelei/svg?seed=${seed}&backgroundColor=f1f5f9,e2e8f0,cbd5e1`;

    try {
      await db.update(users).set({ profilePhotoUrl: avatarUrl }).where(eq(users.id, u.id));
      console.log(`✅ ${u.fullName} -> Avatar assigned`);
      count++;
    } catch (e) {
      console.log(`⚠️ Failed to update ${u.fullName}: ${e.message}`);
    }
  }

  console.log(`\n🎉 Updated ${count} users with unique avatars!\n`);
  process.exit(0);
}

updateToAvatars().catch(e => { console.error('❌', e.message); process.exit(1); });
