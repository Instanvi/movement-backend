import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { archiveAtColumn } from './archive-columns';
import { church } from './church.schema';
import { member } from './member.schema';
import { branch } from './branch.schema';

export const family = pgTable('family', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  churchId: uuid('church_id')
    .notNull()
    .references(() => church.id, { onDelete: 'cascade' }),
  branchId: uuid('branch_id').references(() => branch.id, {
    onDelete: 'set null',
  }),
  headOfHouseId: uuid('head_of_house_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  archivedAt: archiveAtColumn(),
});

export const familyRelations = relations(family, ({ one, many }) => ({
  church: one(church, {
    fields: [family.churchId],
    references: [church.id],
  }),
  branch: one(branch, {
    fields: [family.branchId],
    references: [branch.id],
  }),
  members: many(member),
  headOfHouse: one(member, {
    fields: [family.headOfHouseId],
    references: [member.id],
  }),
}));
