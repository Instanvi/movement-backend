import { user } from './user.schema';
import { pgTable, text, timestamp, uuid, decimal } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { archiveAtColumn } from './archive-columns';
import { church } from './church.schema';
import { donation } from './donation.schema';
import { project } from './project.schema';
import { messaging } from './messaging.schema';
import { member } from './member.schema';

export const branch = pgTable('branch', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  churchId: uuid('church_id')
    .notNull()
    .references(() => church.id, { onDelete: 'cascade' }),
  address: text('address'),
  city: text('city'),
  state: text('state'),
  country: text('country'),
  zipCode: text('zip_code'),
  latitude: decimal('latitude', { precision: 10, scale: 8 }),
  longitude: decimal('longitude', { precision: 11, scale: 8 }),
  phoneNumber: text('phone_number'),
  email: text('email'),
  website: text('website'),
  createdBy: uuid('created_by').references(() => user.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  archivedAt: archiveAtColumn(),
});

export const branchRelations = relations(branch, ({ one, many }) => ({
  church: one(church, {
    fields: [branch.churchId],
    references: [church.id],
  }),
  donations: many(donation),
  projects: many(project),
  messagings: many(messaging),
  members: many(member),
}));
