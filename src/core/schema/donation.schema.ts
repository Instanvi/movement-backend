import {
  pgTable,
  text,
  timestamp,
  uuid,
  decimal,
  pgEnum,
  boolean,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { archiveAtColumn } from './archive-columns';
import { church } from './church.schema';
import { branch } from './branch.schema';
import { user } from './user.schema';
import { project, projectItem } from './project.schema';
import { family } from './family.schema';
import { fund } from './finance.schema';
import { batch } from './batch.schema';

export const donationMethodEnum = pgEnum('donation_method', [
  'Cash',
  'Check',
  'Online',
  'Bank Transfer',
  'Card',
  'Other',
]);

export const donation = pgTable('donation', {
  id: uuid('id').defaultRandom().primaryKey(),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  currency: text('currency').default('USD').notNull(),
  donorId: uuid('donor_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  churchId: uuid('church_id')
    .notNull()
    .references(() => church.id, { onDelete: 'cascade' }),
  branchId: uuid('branch_id')
    .notNull()
    .references(() => branch.id, { onDelete: 'cascade' }),
  familyId: uuid('family_id').references(() => family.id, {
    onDelete: 'set null',
  }),
  fundId: uuid('fund_id').references(() => fund.id, {
    onDelete: 'set null',
  }),
  batchId: uuid('batch_id').references(() => batch.id, {
    onDelete: 'set null',
  }),
  projectId: uuid('project_id').references(() => project.id, {
    onDelete: 'set null',
  }),
  projectItemId: uuid('project_item_id').references(() => projectItem.id, {
    onDelete: 'set null',
  }),
  method: donationMethodEnum('method').default('Cash').notNull(),
  isRecurring: boolean('is_recurring').default(false).notNull(),
  isAnonymous: boolean('is_anonymous').default(false).notNull(),
  message: text('message'), // used for 'Comment'
  status: text('status').default('completed').notNull(), // 'pending', 'completed', 'failed'
  createdBy: uuid('created_by').references(() => user.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  archivedAt: archiveAtColumn(),
});

export const donationRelations = relations(donation, ({ one }) => ({
  donor: one(user, {
    fields: [donation.donorId],
    references: [user.id],
  }),
  church: one(church, {
    fields: [donation.churchId],
    references: [church.id],
  }),
  branch: one(branch, {
    fields: [donation.branchId],
    references: [branch.id],
  }),
  family: one(family, {
    fields: [donation.familyId],
    references: [family.id],
  }),
  fund: one(fund, {
    fields: [donation.fundId],
    references: [fund.id],
  }),
  batch: one(batch, {
    fields: [donation.batchId],
    references: [batch.id],
  }),
  project: one(project, {
    fields: [donation.projectId],
    references: [project.id],
  }),
  projectItem: one(projectItem, {
    fields: [donation.projectItemId],
    references: [projectItem.id],
  }),
}));
