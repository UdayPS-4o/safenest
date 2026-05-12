const { 
  mysqlTable, 
  serial, 
  varchar, 
  text,
  timestamp, 
  mysqlEnum, 
  boolean,
  int,
  date
} = require('drizzle-orm/mysql-core');

const societies = mysqlTable('societies', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  address: text('address'),
  createdAt: timestamp('created_at').defaultNow(),
});

const users = mysqlTable('users', {
  id: serial('id').primaryKey(),
  phoneNumber: varchar('phone_number', { length: 20 }).unique().notNull(),
  role: mysqlEnum('role', ['RESIDENT', 'GUARD', 'ADMIN', 'HELPER', 'DELIVERY', 'GUEST']).notNull().default('GUEST'),
  fullName: varchar('full_name', { length: 255 }),
  profilePhotoUrl: varchar('profile_photo_url', { length: 512 }),
  societyId: int('society_id').references(() => societies.id),
  accountStatus: mysqlEnum('account_status', ['PENDING', 'APPROVED', 'BANNED']).notNull().default('PENDING'),
  flatNumber: varchar('flat_number', { length: 50 }),
  partnerId: varchar('partner_id', { length: 100 }),
  qrCardId: varchar('qr_card_id', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow(),
});

const workHistory = mysqlTable('work_history', {
  id: serial('id').primaryKey(),
  helperId: int('helper_id').references(() => users.id).notNull(),
  residentId: int('resident_id').references(() => users.id).notNull(),
  societyId: int('society_id').references(() => societies.id).notNull(),
  jobTitle: varchar('job_title', { length: 100 }).notNull(),
  startDate: date('start_date').notNull(),
  endDate: date('end_date'),
  status: mysqlEnum('status', ['ACTIVE', 'TERMINATED']).notNull().default('ACTIVE'),
  createdAt: timestamp('created_at').defaultNow(),
});

const visitorLogs = mysqlTable('visitor_logs', {
  id: serial('id').primaryKey(),
  visitorId: int('visitor_id').references(() => users.id).notNull(),
  societyId: int('society_id').references(() => societies.id).notNull(),
  guardId: int('guard_id').references(() => users.id).notNull(),
  destinationFlat: varchar('destination_flat', { length: 50 }),
  entryTime: timestamp('entry_time').defaultNow().notNull(),
  exitTime: timestamp('exit_time'),
  entryStatus: mysqlEnum('entry_status', ['INSIDE', 'EXITED', 'FLAGGED']).notNull().default('INSIDE'),
  verificationMethod: mysqlEnum('verification_method', ['QR_SCAN', 'PHONE_SEARCH', 'PRE_APPROVAL']).notNull(),
});

const preApprovals = mysqlTable('pre_approvals', {
  id: serial('id').primaryKey(),
  residentId: int('resident_id').references(() => users.id).notNull(),
  societyId: int('society_id').references(() => societies.id).notNull(),
  visitorPhone: varchar('visitor_phone', { length: 20 }).notNull(),
  visitorName: varchar('visitor_name', { length: 255 }).notNull(),
  qrCodeValue: varchar('qr_code_value', { length: 255 }).unique().notNull(),
  validFrom: timestamp('valid_from').notNull(),
  validUntil: timestamp('valid_until').notNull(),
  isUsed: boolean('is_used').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

const incidentsAndAlerts = mysqlTable('incidents_and_alerts', {
  id: serial('id').primaryKey(),
  reportedById: int('reported_by_id').references(() => users.id).notNull(),
  societyId: int('society_id').references(() => societies.id).notNull(),
  targetUserId: int('target_user_id').references(() => users.id),
  description: text('description').notNull(),
  severity: mysqlEnum('severity', ['LOW', 'HIGH', 'SOS']).notNull(),
  status: mysqlEnum('status', ['OPEN', 'RESOLVED']).notNull().default('OPEN'),
  createdAt: timestamp('created_at').defaultNow(),
});

module.exports = { 
  societies, 
  users, 
  workHistory, 
  visitorLogs, 
  preApprovals, 
  incidentsAndAlerts 
};
