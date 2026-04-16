import { user } from './user.schema';
import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { archiveAtColumn } from './archive-columns';
import { church } from './church.schema';
import { branch } from './branch.schema';

export const messaging = pgTable('messaging', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  type: text('type').notNull(), // 'info', 'announcement', 'event'
  churchId: uuid('church_id')
    .notNull()
    .references(() => church.id, { onDelete: 'cascade' }),
  branchId: uuid('branch_id').references(() => branch.id, {
    onDelete: 'cascade',
  }), // Optional: if null, it's for the whole organization
  targetAudience: text('target_audience').default('all').notNull(), // 'all', 'new_members', 'old_members', etc.
  createdBy: uuid('created_by').references(() => user.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  archivedAt: archiveAtColumn(),
});

export const messagingRelations = relations(messaging, ({ one }) => ({
  church: one(church, {
    fields: [messaging.churchId],
    references: [church.id],
  }),
  branch: one(branch, {
    fields: [messaging.branchId],
    references: [branch.id],
  }),
}));
