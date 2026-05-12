require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { db } = require('../db');
const { marketplaceListings, users, societies } = require('./schema.mysql');
const { eq } = require('drizzle-orm');

async function seedMarketplace() {
  // Get the society
  const [society] = await db.select().from(societies).limit(1);
  if (!society) { console.error('No society found'); process.exit(1); }

  // Get a few residents/users as sellers
  const allUsers = await db.select().from(users).where(eq(users.societyId, society.id));
  const sellers = allUsers.filter(u => ['RESIDENT', 'ADMIN'].includes(u.role));

  if (sellers.length === 0) { console.error('No residents found'); process.exit(1); }

  const pick = (i) => sellers[i % sellers.length];

  const listings = [
    {
      sellerId: pick(0).id, societyId: society.id,
      title: 'Yamaha Acoustic Guitar',
      description: 'Beautiful Yamaha F310 acoustic guitar in excellent condition. Bought 2 years ago, rarely used. Comes with soft case and extra strings. Perfect for beginners.',
      type: 'SELL', price: 4500, category: 'Music',
      imageUrl: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400&q=80',
      sellerFlat: pick(0).flatNumber, sellerName: pick(0).fullName, sellerPhone: pick(0).phoneNumber, status: 'ACTIVE',
    },
    {
      sellerId: pick(1).id, societyId: society.id,
      title: 'Study Table with Bookshelf',
      description: 'Solid wood study table with attached bookshelf. 4 feet wide, great for kids or home office. Minor scratch on top. Self-pickup from flat.',
      type: 'SELL', price: 3200, category: 'Furniture',
      imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80',
      sellerFlat: pick(1).flatNumber, sellerName: pick(1).fullName, sellerPhone: pick(1).phoneNumber, status: 'ACTIVE',
    },
    {
      sellerId: pick(2).id, societyId: society.id,
      title: 'Canon DSLR Camera (700D)',
      description: 'Canon EOS 700D with 18-55mm kit lens. Shutter count under 5000. Comes with 2 batteries, charger, 32GB SD card and camera bag. Great for photography enthusiasts.',
      type: 'RENT', price: 800, rentPeriod: 'per day', category: 'Electronics',
      imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&q=80',
      sellerFlat: pick(2).flatNumber, sellerName: pick(2).fullName, sellerPhone: pick(2).phoneNumber, status: 'ACTIVE',
    },
    {
      sellerId: pick(0).id, societyId: society.id,
      title: 'Badminton Rackets (Set of 2)',
      description: 'Yonex badminton racket set. Good quality, used for about 6 months. Includes 2 rackets and a tube of shuttlecocks. Ready to play!',
      type: 'RENT', price: 150, rentPeriod: 'per day', category: 'Sports',
      imageUrl: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=400&q=80',
      sellerFlat: pick(0).flatNumber, sellerName: pick(0).fullName, sellerPhone: pick(0).phoneNumber, status: 'ACTIVE',
    },
    {
      sellerId: pick(1).id, societyId: society.id,
      title: 'Box of Children\'s Books (20+)',
      description: 'Collection of 20+ children\'s books. Ages 4–10. Includes Roald Dahl, Geronimo Stilton, and more. All in good reading condition. Great for kids!',
      type: 'FREE', price: null, category: 'Books',
      imageUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&q=80',
      sellerFlat: pick(1).flatNumber, sellerName: pick(1).fullName, sellerPhone: pick(1).phoneNumber, status: 'ACTIVE',
    },
    {
      sellerId: pick(2).id, societyId: society.id,
      title: 'Samsung 32" LED TV',
      description: 'Samsung 32-inch Full HD Smart TV. Works perfectly. Selling because upgrading to a bigger screen. Remote included, wall mount not included.',
      type: 'SELL', price: 9500, category: 'Electronics',
      imageUrl: 'https://images.unsplash.com/photo-1593359677879-a4bb92f4834b?w=400&q=80',
      sellerFlat: pick(2).flatNumber, sellerName: pick(2).fullName, sellerPhone: pick(2).phoneNumber, status: 'ACTIVE',
    },
    {
      sellerId: pick(0).id, societyId: society.id,
      title: 'Foldable Cycle / Bicycle',
      description: 'Firefox foldable cycle, 21-speed. Used for evening rides for a year. Tyres recently changed. Light, easy to carry in lift. No scratches, clean condition.',
      type: 'SELL', price: 6800, category: 'Vehicles',
      imageUrl: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=400&q=80',
      sellerFlat: pick(0).flatNumber, sellerName: pick(0).fullName, sellerPhone: pick(0).phoneNumber, status: 'ACTIVE',
    },
    {
      sellerId: pick(1).id, societyId: society.id,
      title: 'Air Fryer (Philips)',
      description: 'Philips HD9252 Air Fryer. 1.8 kg capacity. Used about 30 times. Perfectly functional. Selling because we moved to a bigger model. Manual included.',
      type: 'SELL', price: 3800, category: 'Kitchen',
      imageUrl: 'https://images.unsplash.com/photo-1585325701956-60dd9c8553bc?w=400&q=80',
      sellerFlat: pick(1).flatNumber, sellerName: pick(1).fullName, sellerPhone: pick(1).phoneNumber, status: 'ACTIVE',
    },
    {
      sellerId: pick(2).id, societyId: society.id,
      title: 'Yoga Mat + Resistance Bands',
      description: 'Premium 6mm yoga mat (anti-slip) + set of 5 resistance bands (different strengths). Perfect for home workouts. Mat lightly used, bands unopened.',
      type: 'FREE', price: null, category: 'Sports',
      imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&q=80',
      sellerFlat: pick(2).flatNumber, sellerName: pick(2).fullName, sellerPhone: pick(2).phoneNumber, status: 'ACTIVE',
    },
    {
      sellerId: pick(0).id, societyId: society.id,
      title: 'PlayStation 4 (PS4 Slim)',
      description: 'Sony PS4 Slim 500GB. Comes with 2 controllers and 5 games (FIFA 23, God of War, GTA V, Spider-Man, Uncharted 4). Everything works great!',
      type: 'RENT', price: 500, rentPeriod: 'per day', category: 'Electronics',
      imageUrl: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=400&q=80',
      sellerFlat: pick(0).flatNumber, sellerName: pick(0).fullName, sellerPhone: pick(0).phoneNumber, status: 'ACTIVE',
    },
    {
      sellerId: pick(1).id, societyId: society.id,
      title: 'Winter Jackets (M & L)',
      description: 'Two branded winter jackets — one medium, one large. Both in very good condition. From Decathlon & Zara. Ideal if you are travelling to a cold place.',
      type: 'SELL', price: 1200, category: 'Clothing',
      imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&q=80',
      sellerFlat: pick(1).flatNumber, sellerName: pick(1).fullName, sellerPhone: pick(1).phoneNumber, status: 'ACTIVE',
    },
    {
      sellerId: pick(2).id, societyId: society.id,
      title: 'Lego City Sets (3 boxes)',
      description: 'Three complete Lego City sets — Fire Station, Police Car, and Space Shuttle. All pieces included and sorted. Instructions booklets intact. Kids\' treasure!',
      type: 'SELL', price: 2200, category: 'Toys',
      imageUrl: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=400&q=80',
      sellerFlat: pick(2).flatNumber, sellerName: pick(2).fullName, sellerPhone: pick(2).phoneNumber, status: 'ACTIVE',
    },
  ];

  let created = 0;
  for (const l of listings) {
    try {
      await db.insert(marketplaceListings).values(l);
      console.log(`✅ ${l.type} – ${l.title}`);
      created++;
    } catch (e) {
      console.log(`⚠️  Skipped (${l.title}): ${e.message}`);
    }
  }

  console.log(`\n🎉 Seeded ${created} marketplace listings!\n`);
  process.exit(0);
}

seedMarketplace().catch(e => { console.error(e); process.exit(1); });
