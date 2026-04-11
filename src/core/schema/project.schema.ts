import { pgTable, text, timestamp, uuid, decimal } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { archiveAtColumn } from './archive-columns';
import { church } from './church.schema';
import { branch } from './branch.schema';
import { donation } from './donation.schema';

export const project = pgTable('project', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  targetAmount: decimal('target_amount', { precision: 12, scale: 2 }).notNull(),
  currentAmount: decimal('current_amount', { precision: 12, scale: 2 })
    .default('0')
    .notNull(),
  churchId: uuid('church_id')
    .notNull()
    .references(() => church.id, { onDelete: 'cascade' }),
  branchId: uuid('branch_id')
    .notNull()
    .references(() => branch.id, { onDelete: 'cascade' }),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date'),
  status: text('status').default('active').notNull(), // 'active', 'completed', 'cancelled'
  createdAt: timestamp('created_at').defaultNow().notNull(),
  archivedAt: archiveAtColumn(),
});

export const projectItem = pgTable('project_item', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id')
    .notNull()
    .references(() => project.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  targetAmount: decimal('target_amount', { precision: 12, scale: 2 }),
  currentAmount: decimal('current_amount', { precision: 12, scale: 2 }).default(
    '0',
  ),
  archivedAt: archiveAtColumn(),
});

export const projectRelations = relations(project, ({ one, many }) => ({
  church: one(church, {
    fields: [project.churchId],
    references: [church.id],
  }),
  branch: one(branch, {
    fields: [project.branchId],
    references: [branch.id],
  }),
  items: many(projectItem),
  donations: many(donation),
}));

export const projectItemRelations = relations(projectItem, ({ one }) => ({
  project: one(project, {
    fields: [projectItem.projectId],
    references: [project.id],
  }),
}));
