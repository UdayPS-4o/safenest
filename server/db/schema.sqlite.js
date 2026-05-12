const { 
  sqliteTable, 
  integer, 
  text
} = require('drizzle-orm/sqlite-core');
const { sql } = require('drizzle-orm');

const societies = sqliteTable('societies', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  address: text('address'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

const users = sqliteTable('users', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  phoneNumber: text('phone_number').unique().notNull(),
  role: text('role').notNull().default('GUEST'), // 'RESIDENT', 'GUARD', 'ADMIN', 'HELPER', 'DELIVERY', 'GUEST'
  fullName: text('full_name'),
  profilePhotoUrl: text('profile_photo_url'),
  societyId: integer('society_id').references(() => societies.id),
  accountStatus: text('account_status').notNull().default('PENDING'), // 'PENDING', 'APPROVED', 'BANNED'
  flatNumber: text('flat_number'),
  partnerId: text('partner_id'),
  qrCardId: text('qr_card_id'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

const workHistory = sqliteTable('work_history', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  helperId: integer('helper_id').references(() => users.id).notNull(),
  residentId: integer('resident_id').references(() => users.id).notNull(),
  societyId: integer('society_id').references(() => societies.id).notNull(),
  jobTitle: text('job_title').notNull(),
  startDate: text('start_date').notNull(),
  endDate: text('end_date'),
  status: text('status').notNull().default('ACTIVE'), // 'ACTIVE', 'TERMINATED'
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

const visitorLogs = sqliteTable('visitor_logs', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  visitorId: integer('visitor_id').references(() => users.id).notNull(),
  societyId: integer('society_id').references(() => societies.id).notNull(),
  guardId: integer('guard_id').references(() => users.id).notNull(),
  destinationFlat: text('destination_flat'),
  entryTime: text('entry_time').default(sql`CURRENT_TIMESTAMP`).notNull(),
  exitTime: text('exit_time'),
  entryStatus: text('entry_status').notNull().default('INSIDE'), // 'INSIDE', 'EXITED', 'FLAGGED'
  verificationMethod: text('verification_method').notNull(), // 'QR_SCAN', 'PHONE_SEARCH', 'PRE_APPROVAL'
});

const preApprovals = sqliteTable('pre_approvals', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  residentId: integer('resident_id').references(() => users.id).notNull(),
  societyId: integer('society_id').references(() => societies.id).notNull(),
  visitorPhone: text('visitor_phone').notNull(),
  visitorName: text('visitor_name').notNull(),
  qrCodeValue: text('qr_code_value').unique().notNull(),
  validFrom: text('valid_from').notNull(),
  validUntil: text('valid_until').notNull(),
  isUsed: integer('is_used', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

const incidentsAndAlerts = sqliteTable('incidents_and_alerts', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  reportedById: integer('reported_by_id').references(() => users.id).notNull(),
  societyId: integer('society_id').references(() => societies.id).notNull(),
  targetUserId: integer('target_user_id').references(() => users.id),
  description: text('description').notNull(),
  severity: text('severity').notNull(), // 'LOW', 'HIGH', 'SOS'
  status: text('status').notNull().default('OPEN'), // 'OPEN', 'RESOLVED'
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

module.exports = { 
  societies, 
  users, 
  workHistory, 
  visitorLogs, 
  preApprovals, 
  incidentsAndAlerts 
};
