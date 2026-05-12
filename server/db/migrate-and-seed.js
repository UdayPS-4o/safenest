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
    // ── Residents ────────────────────────────────────────────────
    {
      phoneNumber: '+919876543211',
      role: 'RESIDENT',
      fullName: 'Arjun Sharma',
      profilePhotoUrl: 'https://images.unsplash.com/photo-1615813967515-e1838c1c56dd?w=400&q=80',
      societyId,
      accountStatus: 'APPROVED',
      flatNumber: 'B-201',
    },
    {
      phoneNumber: '+919800011111',
      role: 'RESIDENT',
      fullName: 'Priya Menon',
      profilePhotoUrl: 'https://images.unsplash.com/photo-1589419107936-ce47e923e512?w=400&q=80',
      societyId,
      accountStatus: 'APPROVED',
      flatNumber: 'A-105',
    },
    {
      phoneNumber: '+919800022222',
      role: 'RESIDENT',
      fullName: 'Vikram Patel',
      profilePhotoUrl: 'https://images.unsplash.com/photo-1555519822-4416972412b9?w=400&q=80',
      societyId,
      accountStatus: 'APPROVED',
      flatNumber: 'C-304',
    },
    {
      phoneNumber: '+919800033333',
      role: 'RESIDENT',
      fullName: 'Ananya Krishnan',
      profilePhotoUrl: 'https://images.unsplash.com/photo-1506894008272-38d17b409dd6?w=400&q=80',
      societyId,
      accountStatus: 'APPROVED',
      flatNumber: 'D-402',
    },

    // ── Guards ───────────────────────────────────────────────────
    {
      phoneNumber: '+919876543212',
      role: 'GUARD',
      fullName: 'Ramesh Singh',
      profilePhotoUrl: 'https://raw.githubusercontent.com/UdayPS-4o/safenest/main/server/public/avatars/indian_security_man_1778573569801.png',
      societyId,
      accountStatus: 'APPROVED',
    },
    {
      phoneNumber: '+919800044444',
      role: 'GUARD',
      fullName: 'Suresh Yadav',
      profilePhotoUrl: 'https://raw.githubusercontent.com/UdayPS-4o/safenest/main/server/public/avatars/indian_cleaner_man_1778573531719.png',
      societyId,
      accountStatus: 'APPROVED',
    },

    // ── Helpers ──────────────────────────────────────────────────
    {
      phoneNumber: '+919876543213',
      role: 'HELPER',
      fullName: 'Meena Kumari',          // renamed from Sunita Devi
      profilePhotoUrl: 'https://raw.githubusercontent.com/UdayPS-4o/safenest/main/server/public/avatars/indian_cook_woman_1778573490759.png',
      societyId,
      accountStatus: 'APPROVED',
      partnerId: 'HLP-8921',
      qrCardId: 'CARD-101',
    },
    {
      phoneNumber: '+919800055551',
      role: 'HELPER',
      fullName: 'Kavita Sharma',
      profilePhotoUrl: 'https://raw.githubusercontent.com/UdayPS-4o/safenest/main/server/public/avatars/indian_sweeper_woman_1778573512150.png',
      societyId,
      accountStatus: 'APPROVED',
      partnerId: 'HLP-8922',
      qrCardId: 'CARD-102',
    },
    {
      phoneNumber: '+919876543210',
      role: 'HELPER',
      fullName: 'Ramesh Kumar',
      profilePhotoUrl: 'https://images.unsplash.com/photo-1533069152285-d8b52f1eec36?w=400&q=80',
      societyId,
      accountStatus: 'APPROVED',
      partnerId: 'HLP-8923',
      qrCardId: 'CARD-103',
    },
    {
      phoneNumber: '+919800055552',
      role: 'HELPER',
      fullName: 'Lakshmi Bai',
      profilePhotoUrl: 'https://raw.githubusercontent.com/UdayPS-4o/safenest/main/server/public/avatars/indian_security_woman_1778573549659.png',
      societyId,
      accountStatus: 'APPROVED',
      partnerId: 'HLP-8924',
      qrCardId: 'CARD-104',
    },
    {
      phoneNumber: '+919800055553',
      role: 'HELPER',
      fullName: 'Mohan Das',
      profilePhotoUrl: 'https://images.unsplash.com/photo-1516008628005-cb9bb3db7b0a?w=400&q=80',
      societyId,
      accountStatus: 'APPROVED',
      partnerId: 'HLP-8925',
      qrCardId: 'CARD-105',
    },
    {
      phoneNumber: '+919800055554',
      role: 'HELPER',
      fullName: 'Geeta Devi',
      profilePhotoUrl: 'https://images.unsplash.com/photo-1517409241517-f5da1daff4f4?w=400&q=80',
      societyId,
      accountStatus: 'APPROVED',
      partnerId: 'HLP-8926',
      qrCardId: 'CARD-106',
    },
    {
      phoneNumber: '+919800055555',
      role: 'HELPER',
      fullName: 'Rajesh Patel',
      profilePhotoUrl: 'https://images.unsplash.com/photo-1502409029705-ebcf858d4076?w=400&q=80',
      societyId,
      accountStatus: 'APPROVED',
      partnerId: 'HLP-8927',
      qrCardId: 'CARD-107',
    },
    {
      phoneNumber: '+919800055556',
      role: 'HELPER',
      fullName: 'Anita Singh',
      profilePhotoUrl: 'https://images.unsplash.com/photo-1615179538356-94676101962d?w=400&q=80',
      societyId,
      accountStatus: 'APPROVED',
      partnerId: 'HLP-8928',
      qrCardId: 'CARD-108',
    },

    // ── Admin ────────────────────────────────────────────────────
    {
      phoneNumber: '+919876543214',
      role: 'ADMIN',
      fullName: 'Rajan Mehta',
      profilePhotoUrl: 'https://images.unsplash.com/photo-1520630650953-294b30e42d7f?w=400&q=80',
      societyId,
      accountStatus: 'APPROVED',
    },

    // ── Delivery ─────────────────────────────────────────────────
    {
      phoneNumber: '+919876543215',
      role: 'DELIVERY',
      fullName: 'Rahul Kumar',
      profilePhotoUrl: 'https://images.unsplash.com/photo-1550927877-c91f63dcad1a?w=400&q=80',
      societyId,
      accountStatus: 'APPROVED',
      partnerId: 'SWG-4829301',
    },

    // ── Pending approval users for testing ───────────────────────
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
      // Restore realistic photos if they were lost
      if (u.profilePhotoUrl) {
        await db.update(users).set({ profilePhotoUrl: u.profilePhotoUrl }).where(eq(users.id, existing.id));
        console.log(`⏭️  Already exists (updated photo): ${u.fullName}`);
      } else {
        console.log(`⏭️  Already exists: ${u.fullName}`);
      }
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
