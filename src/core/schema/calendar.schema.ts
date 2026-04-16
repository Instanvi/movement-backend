import {
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
  pgEnum,
  boolean,
  time,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { archiveAtColumn } from './archive-columns';
import { church } from './church.schema';
import { branch } from './branch.schema';
import { user } from './user.schema';
import { member } from './member.schema';

export const bookingStatusEnum = pgEnum('booking_status', [
  'pending',
  'confirmed',
  'completed',
  'cancelled',
  'no-show',
]);

export const followUpStatusEnum = pgEnum('follow_up_status', [
  'pending',
  'in-progress',
  'completed',
  'failed',
]);

export const room = pgTable('room', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  capacity: integer('capacity'),
  churchId: uuid('church_id')
    .notNull()
    .references(() => church.id, { onDelete: 'cascade' }),
  branchId: uuid('branch_id').references(() => branch.id, {
    onDelete: 'set null',
  }),
  createdBy: uuid('created_by').references(() => user.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  archivedAt: archiveAtColumn(),
});

export const resource = pgTable('resource', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  type: text('type').notNull(), // e.g. 'EQUIPMENT', 'VEHICLE', 'MEDIA'
  churchId: uuid('church_id')
    .notNull()
    .references(() => church.id, { onDelete: 'cascade' }),
  branchId: uuid('branch_id').references(() => branch.id, {
    onDelete: 'set null',
  }),
  createdBy: uuid('created_by').references(() => user.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  archivedAt: archiveAtColumn(),
});

export const appointmentType = pgTable('appointment_type', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  location: text('location').default('via Phone').notNull(),
  visibility: text('visibility').default('public').notNull(), // 'public', 'private'
  duration: integer('duration').default(30).notNull(), // in minutes
  churchId: uuid('church_id')
    .notNull()
    .references(() => church.id, { onDelete: 'cascade' }),
  branchId: uuid('branch_id').references(() => branch.id, {
    onDelete: 'set null',
  }),
  createdBy: uuid('created_by').references(() => user.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  archivedAt: archiveAtColumn(),
});

export const appointmentSchedule = pgTable('appointment_schedule', {
  id: uuid('id').defaultRandom().primaryKey(),
  appointmentTypeId: uuid('appointment_type_id')
    .notNull()
    .references(() => appointmentType.id, { onDelete: 'cascade' }),
  dayOfWeek: integer('day_of_week').notNull(), // 0-6 (Sun-Sat)
  startTime: time('start_time').notNull(),
  endTime: time('end_time').notNull(),
  archivedAt: archiveAtColumn(),
});

export const appointmentBooking = pgTable('appointment_booking', {
  id: uuid('id').defaultRandom().primaryKey(),
  appointmentTypeId: uuid('appointment_type_id')
    .notNull()
    .references(() => appointmentType.id, { onDelete: 'cascade' }),
  userId: uuid('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time').notNull(),
  status: bookingStatusEnum('status').default('pending').notNull(),
  notes: text('notes'),
  createdBy: uuid('created_by').references(() => user.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  archivedAt: archiveAtColumn(),
});

export const followUp = pgTable('follow_up', {
  id: uuid('id').defaultRandom().primaryKey(),
  memberId: uuid('member_id')
    .notNull()
    .references(() => member.id, { onDelete: 'cascade' }),
  assignedToId: uuid('assigned_to_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  type: text('type').notNull(), // e.g. 'First-timer', 'Absence'
  action: text('action').notNull(), // e.g. 'Call', 'Visit', 'Email'
  followUpDate: timestamp('follow_up_date').notNull(),
  status: followUpStatusEnum('status').default('pending').notNull(),
  notes: text('notes'),
  churchId: uuid('church_id')
    .notNull()
    .references(() => church.id, { onDelete: 'cascade' }),
  createdBy: uuid('created_by').references(() => user.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  archivedAt: archiveAtColumn(),
});

export const calendarEvent = pgTable('calendar_event', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time').notNull(),
  location: text('location'),
  allDay: boolean('all_day').default(false).notNull(),
  recurrenceRule: text('recurrence_rule'),
  churchId: uuid('church_id')
    .notNull()
    .references(() => church.id, { onDelete: 'cascade' }),
  branchId: uuid('branch_id').references(() => branch.id, {
    onDelete: 'set null',
  }),
  createdBy: uuid('created_by').references(() => user.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  archivedAt: archiveAtColumn(),
});

// Relations
export const roomRelations = relations(room, ({ one }) => ({
  church: one(church, { fields: [room.churchId], references: [church.id] }),
  branch: one(branch, { fields: [room.branchId], references: [branch.id] }),
}));

export const appointmentTypeRelations = relations(
  appointmentType,
  ({ one, many }) => ({
    church: one(church, {
      fields: [appointmentType.churchId],
      references: [church.id],
    }),
    schedules: many(appointmentSchedule),
    bookings: many(appointmentBooking),
  }),
);

export const followUpRelations = relations(followUp, ({ one }) => ({
  member: one(member, { fields: [followUp.memberId], references: [member.id] }),
  assignedTo: one(user, {
    fields: [followUp.assignedToId],
    references: [user.id],
  }),
  church: one(church, { fields: [followUp.churchId], references: [church.id] }),
}));
