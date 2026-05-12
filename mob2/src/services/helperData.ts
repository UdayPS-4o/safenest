/**
 * Indian-looking avatar photos and helper enrichment data.
 * Uses curated portrait IDs from randomuser.me (South-Asian/Indian looking portraits)
 * and adds realistic Indian names, specialties, rates, and bios.
 */

// Randomuser.me portrait IDs that tend to look South Asian / Indian
const INDIAN_FEMALE_IDS = [33, 44, 56, 65, 72, 26, 62, 48, 89, 90, 58, 51];
const INDIAN_MALE_IDS = [33, 55, 68, 76, 44, 83, 28, 46, 91, 70, 52, 47];

const JOB_TITLES = ['Cook', 'Maid', 'Driver', 'Nanny', 'Sweeper', 'Security'];
const SPECIALTIES: Record<string, string[]> = {
  Cook: ['North Indian', 'South Indian', 'Baking', 'Tiffin Service', 'Vegetarian', 'Chinese'],
  Maid: ['Deep Cleaning', 'Laundry', 'Ironing', 'Utensils', 'Full-Time', 'Part-Time'],
  Driver: ['Automatic', 'Night Drives', 'Outstation', 'School Pickup', 'Senior Citizen'],
  Nanny: ['Infant Care', 'School Age', 'Night Duty', 'Special Needs', 'Activities'],
  Sweeper: ['Common Area', 'Corridor', 'Terrace', 'Parking'],
  Security: ['CCTV', 'Gate Duty', 'Patrolling', 'Night Shift'],
};

const RATES: Record<string, string> = {
  Cook: '₹180/hr',
  Maid: '₹120/hr',
  Driver: '₹250/hr',
  Nanny: '₹200/hr',
  Sweeper: '₹100/hr',
  Security: '₹150/hr',
};

const BIOS: string[] = [
  'Dedicated professional with 8+ years of experience working in gated societies across Delhi NCR.',
  'Trusted by over 20 families in Pune and Mumbai. Reliable, punctual, and hardworking.',
  'Former hotel staff with hygiene certification. Comfortable with all household tasks.',
  'Born and raised in UP. Specialises in traditional home cooking and childcare.',
  'Government-verified background check completed. Ex-employee of embassy residential compound.',
  'ISO-certified cleaning professional. Works efficiently without supervision.',
];

const REVIEWS_POOL = [
  { name: 'Meera Iyer', flat: 'A-204', text: 'Very reliable and honest. Never missed a day in 2 years.', stars: 5 },
  { name: 'Rajesh Gupta', flat: 'B-105', text: 'Food is excellent — my kids love the daal and sabzi!', stars: 5 },
  { name: 'Priya Nair', flat: 'C-301', text: 'Trusted completely. Handles everything with care.', stars: 4 },
  { name: 'Aditya Sharma', flat: 'D-402', text: 'Very professional. Comes on time every day.', stars: 5 },
  { name: 'Sunitha Rao', flat: 'E-103', text: 'Good worker. Wish she could come on Sundays too.', stars: 4 },
  { name: 'Vikram Malhotra', flat: 'A-501', text: 'Trustworthy. Has been with us for 3 years now.', stars: 5 },
  { name: 'Ananya Reddy', flat: 'B-202', text: 'Cleans very well and is polite and respectful.', stars: 4 },
  { name: 'Ravi Krishnan', flat: 'C-404', text: 'Excellent driver. Patient and knowledgeable of all routes.', stars: 5 },
];

const WORK_HISTORY_POOL = [
  { society: 'Green Valley CHS', location: 'Andheri West, Mumbai', duration: '2021 – Present', role: '', status: 'current' },
  { society: 'Raheja Residency', location: 'Malad, Mumbai', duration: '2019 – 2021', role: '', status: 'past' },
  { society: 'Shreeji Heights', location: 'Borivali, Mumbai', duration: '2017 – 2019', role: '', status: 'past' },
  { society: 'Blue Orchid CHS', location: 'Powai, Mumbai', duration: '2020 – Present', role: '', status: 'current' },
  { society: 'Suparshwa Towers', location: 'Thane West', duration: '2018 – 2020', role: '', status: 'past' },
  { society: 'Royal Palms Estate', location: 'Goregaon East', duration: '2022 – Present', role: '', status: 'current' },
];

function seededPick<T>(arr: T[], id: number): T {
  return arr[Math.abs(id * 7 + 3) % arr.length];
}

function getGender(name: string): 'female' | 'male' {
  // Common Indian female name endings
  const femaleNames = ['sunita', 'kavita', 'priya', 'meera', 'ananya', 'pooja', 'radha', 'rekha', 'lata', 'renu', 'usha', 'geeta'];
  const lower = name.toLowerCase().split(' ')[0];
  return femaleNames.some(f => lower.startsWith(f) || lower.includes(f)) ? 'female' : 'male';
}

export function getHelperPhoto(helper: any): string {
  if (helper.profilePhotoUrl) return helper.profilePhotoUrl;
  const gender = getGender(helper.fullName || '');
  const ids = gender === 'female' ? INDIAN_FEMALE_IDS : INDIAN_MALE_IDS;
  const portraitId = seededPick(ids, helper.id || 1);
  return `https://randomuser.me/api/portraits/${gender === 'female' ? 'women' : 'men'}/${portraitId}.jpg`;
}

export function enrichHelper(helper: any) {
  const id = helper.id || 1;
  const jobTitle = seededPick(JOB_TITLES, id);
  const specs = seededPick(Object.values(SPECIALTIES), id) as string[];
  const mySpecs = specs.slice(0, 2 + (id % 3));

  // Pick 2-4 reviews
  const reviewCount = 2 + (id % 3);
  const reviews = REVIEWS_POOL.slice(id % 4, (id % 4) + reviewCount);

  // Pick 2-3 work history items
  const whCount = 2 + (id % 2);
  const workHistory = WORK_HISTORY_POOL.slice(id % 4, (id % 4) + whCount).map(w => ({ ...w, role: jobTitle }));

  const rating = parseFloat((4.1 + (id % 9) * 0.1).toFixed(1));
  const societies = 1 + (id % 5);
  const rate = RATES[jobTitle] || '₹150/hr';
  const bio = seededPick(BIOS, id);
  const totalJobs = 20 + (id % 80);
  const yearsExp = 2 + (id % 8);

  return {
    ...helper,
    jobTitle,
    specialties: mySpecs,
    rating,
    societies,
    rate,
    bio,
    totalJobs,
    yearsExp,
    reviews,
    workHistory,
    photoUrl: getHelperPhoto(helper),
  };
}
