/**
 * Drizzle Migrate + Seed for MySQL (Cloud Run / Cloud SQL)
 * 
 * Usage:
 *   node db/migrate-and-seed.js           — run migrations + seed
 *   node db/migrate-and-seed.js --seed    — seed only (skip migrate)
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { execSync } = require('child_process');
const { db, schema } = require('./index');
const { societies, users } = schema;
const { eq } = require('drizzle-orm');

const seedOnly = process.argv.includes('--seed');

async function migrate() {
  console.log('\n📦 Running Drizzle migrations (push to MySQL)...');
  try {
    execSync('npx drizzle-kit push', {
      cwd: require('path').join(__dirname, '..'),
      stdio: 'inherit',
    });
    console.log('✅ Schema pushed successfully.\n');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  }
}

async function seed() {
  console.log('🌱 Seeding initial data...\n');

  // --- Society ---
  const [existingSoc] = await db.select().from(societies).limit(1);
  let societyId;

  if (!existingSoc) {
    const result = await db.insert(societies).values({
      name: 'Whitefield Smart Society',
      address: '123 Main Street, Bengaluru, Karnataka 560066',
    });
    societyId = result[0].insertId;
    console.log(`✅ Created society: Whitefield Smart Society (id=${societyId})`);
  } else {
    societyId = existingSoc.id;
    console.log(`⏭️  Society already exists (id=${societyId})`);
  }

  // --- Seed Users ---
  const seedUsers = [
    {
      phoneNumber: '+919876543211',
      role: 'RESIDENT',
      fullName: 'Arjun Sharma',
      profilePhotoUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
      societyId,
      accountStatus: 'APPROVED',
      flatNumber: 'B-201',
    },
    {
      phoneNumber: '+919876543212',
      role: 'GUARD',
      fullName: 'Ramesh Singh',
      profilePhotoUrl: 'https://randomuser.me/api/portraits/men/44.jpg',
      societyId,
      accountStatus: 'APPROVED',
    },
    {
      phoneNumber: '+919876543213',
      role: 'HELPER',
      fullName: 'Sunita Devi',
      profilePhotoUrl: 'https://randomuser.me/api/portraits/women/33.jpg',
      societyId,
      accountStatus: 'APPROVED',
      partnerId: 'HLP-8921',
      qrCardId: 'CARD-101',
    },
    {
      phoneNumber: '+919876543213',
      role: 'HELPER',
      fullName: 'Kavita Sharma',
      profilePhotoUrl: 'https://randomuser.me/api/portraits/women/44.jpg',
      societyId,
      accountStatus: 'APPROVED',
      partnerId: 'HLP-8922',
      qrCardId: 'CARD-102',
    },
    {
      phoneNumber: '+919876543210',
      role: 'HELPER',
      fullName: 'Ramesh Kumar',
      profilePhotoUrl: 'https://randomuser.me/api/portraits/men/55.jpg',
      societyId,
      accountStatus: 'APPROVED',
      partnerId: 'HLP-8923',
      qrCardId: 'CARD-103',
    },
    {
      phoneNumber: '+919876543214',
      role: 'ADMIN',
      fullName: 'Society Admin',
      profilePhotoUrl: 'https://randomuser.me/api/portraits/men/90.jpg',
      societyId,
      accountStatus: 'APPROVED',
    },
    {
      phoneNumber: '+919876543215',
      role: 'DELIVERY',
      fullName: 'Rahul Kumar',
      profilePhotoUrl: 'https://randomuser.me/api/portraits/men/22.jpg',
      societyId,
      accountStatus: 'APPROVED',
      partnerId: 'SWG-4829301',
    },
    // Pending approval users for testing
    {
      phoneNumber: '+919900001111',
      role: 'RESIDENT',
      fullName: 'Priya Nair',
      societyId,
      accountStatus: 'PENDING',
      flatNumber: 'A-104',
    },
    {
      phoneNumber: '+919900002222',
      role: 'GUARD',
      fullName: 'Vijay Patil',
      societyId,
      accountStatus: 'PENDING',
    },
  ];

  for (const u of seedUsers) {
    const [existing] = await db.select().from(users).where(eq(users.phoneNumber, u.phoneNumber)).limit(1);
    if (!existing) {
      await db.insert(users).values(u);
      console.log(`✅ Created: ${u.fullName} (${u.role}) → ${u.phoneNumber}`);
    } else {
      console.log(`⏭️  Already exists: ${u.fullName}`);
    }
  }

  console.log('\n🎉 Seeding complete!\n');
}

async function run() {
  try {
    if (!seedOnly) await migrate();
    await seed();
    process.exit(0);
  } catch (err) {
    console.error('❌ Fatal error:', err);
    process.exit(1);
  }
}

run();
