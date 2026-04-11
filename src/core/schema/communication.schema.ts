import {
  pgTable,
  text,
  timestamp,
  uuid,
  boolean,
  jsonb,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { archiveAtColumn } from './archive-columns';
import { church } from './church.schema';
import { member } from './member.schema';

export const announcement = pgTable('announcement', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  content: text('content').notNull(), // Rich text/HTML
  isPinned: boolean('is_pinned').default(false).notNull(),
  isScheduled: boolean('is_scheduled').default(false).notNull(),
  scheduledFor: timestamp('scheduled_for'),
  status: text('status').default('active').notNull(), // 'active', 'draft', 'scheduled', 'archived'
  churchId: uuid('church_id')
    .notNull()
    .references(() => church.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  archivedAt: archiveAtColumn(),
});

export const form = pgTable('form', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  status: text('status').default('open').notNull(), // 'open', 'closed'
  type: text('type').notNull(), // 'registration', 'prayer', 'event', 'volunteer', 'custom'
  schema: jsonb('schema').notNull(), // JSON definition of form fields
  churchId: uuid('church_id')
    .notNull()
    .references(() => church.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  archivedAt: archiveAtColumn(),
});

export const formSubmission = pgTable('form_submission', {
  id: uuid('id').defaultRandom().primaryKey(),
  formId: uuid('form_id')
    .notNull()
    .references(() => form.id, { onDelete: 'cascade' }),
  memberId: uuid('member_id').references(() => member.id, {
    onDelete: 'set null',
  }),
  data: jsonb('data').notNull(), // JSON response data
  submittedAt: timestamp('submitted_at').defaultNow().notNull(),
  archivedAt: archiveAtColumn(),
});

export const announcementRelations = relations(announcement, ({ one }) => ({
  church: one(church, {
    fields: [announcement.churchId],
    references: [church.id],
  }),
}));

export const formRelations = relations(form, ({ one, many }) => ({
  church: one(church, {
    fields: [form.churchId],
    references: [church.id],
  }),
  submissions: many(formSubmission),
}));

export const formSubmissionRelations = relations(formSubmission, ({ one }) => ({
  form: one(form, {
    fields: [formSubmission.formId],
    references: [form.id],
  }),
  member: one(member, {
    fields: [formSubmission.memberId],
    references: [member.id],
  }),
}));
