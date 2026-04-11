import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { archiveAtColumn } from './archive-columns';
import { member } from './member.schema';
import { invitation } from './invitation.schema';
import { branch } from './branch.schema';
import { donation } from './donation.schema';
import { project } from './project.schema';
import { messaging } from './messaging.schema';
import { subscription } from './subscription.schema';
import { family } from './family.schema';
import { batch } from './batch.schema';

export const church = pgTable('church', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  logo: text('logo'),
  denomination: text('denomination'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  metadata: text('metadata'),
  archivedAt: archiveAtColumn(),
});

export const churchRelations = relations(church, ({ many }) => ({
  members: many(member),
  invitations: many(invitation),
  branches: many(branch),
  donations: many(donation),
  projects: many(project),
  messagings: many(messaging),
  subscriptions: many(subscription),
  families: many(family),
  batches: many(batch),
}));
