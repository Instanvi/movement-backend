import { pgTable, text, timestamp, uuid, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { archiveAtColumn } from './archive-columns';
import { church } from './church.schema';
import { branch } from './branch.schema';
import { donation } from './donation.schema';

export const batchStatusEnum = pgEnum('batch_status', [
  'open',
  'closed',
  'processing',
  'voided',
]);

export const batch = pgTable('batch', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  status: batchStatusEnum('status').default('open').notNull(),
  batchDate: timestamp('batch_date').defaultNow().notNull(),
  churchId: uuid('church_id')
    .notNull()
    .references(() => church.id, { onDelete: 'cascade' }),
  branchId: uuid('branch_id').references(() => branch.id, {
    onDelete: 'set null',
  }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  archivedAt: archiveAtColumn(),
});

export const batchRelations = relations(batch, ({ one, many }) => ({
  church: one(church, {
    fields: [batch.churchId],
    references: [church.id],
  }),
  branch: one(branch, {
    fields: [batch.branchId],
    references: [branch.id],
  }),
  donations: many(donation),
}));
