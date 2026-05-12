const { execSync } = require('child_process');
const path = require('path');
const { db, sqlite } = require('./index');
const { societies, users } = require('./schema');
const { eq } = require('drizzle-orm');

async function seed() {
  console.log('Running Drizzle Kit to create SQLite schema...');
  try {
    execSync('npx drizzle-kit push', { 
      cwd: path.join(__dirname, '..'), 
      stdio: 'inherit' 
    });
    console.log('Schema pushed successfully.');
  } catch (error) {
    console.error('Failed to push schema:', error.message);
    process.exit(1);
  }

  console.log('Seeding initial data...');

  try {
    // Check if society exists
    const existingSocieties = db.select().from(societies).all();
    let societyId = 1;
    
    if (existingSocieties.length === 0) {
      const info = db.insert(societies).values({
        name: 'Whitefield Smart Society',
        address: '123 Main St, Bangalore, KA 560066'
      }).run();
      societyId = info.lastInsertRowid;
      console.log('Created Society:', societyId);
    } else {
      societyId = existingSocieties[0].id;
      console.log('Using existing Society:', societyId);
    }

    // Seed test users
    const seedUsers = [
      {
        phoneNumber: '+919876543211',
        role: 'RESIDENT',
        fullName: 'Arjun Sharma',
        profilePhotoUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
        societyId,
        accountStatus: 'APPROVED',
        flatNumber: 'B-201'
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
        fullName: 'Meera Joshi',
        profilePhotoUrl: 'https://randomuser.me/api/portraits/women/44.jpg',
        societyId,
        accountStatus: 'APPROVED',
        partnerId: 'HLP-8921',
        qrCardId: 'CARD-1122'
      },
      {
        phoneNumber: '+919876543214',
        role: 'ADMIN',
        fullName: 'Society Admin',
        profilePhotoUrl: 'https://randomuser.me/api/portraits/men/90.jpg',
        societyId,
        accountStatus: 'APPROVED',
      }
    ];

    for (const user of seedUsers) {
      const existingUser = db.select().from(users).where(eq(users.phoneNumber, user.phoneNumber)).all();
      if (existingUser.length === 0) {
        db.insert(users).values(user).run();
        console.log(`Created user: ${user.fullName} (${user.role}) - ${user.phoneNumber}`);
      } else {
        console.log(`User already exists: ${user.fullName}`);
      }
    }

    console.log('Seeding completed successfully!');
    process.exit(0);

  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seed();
