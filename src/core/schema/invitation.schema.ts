import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { archiveAtColumn } from './archive-columns';
import { church } from './church.schema';
import { user } from './user.schema';

export const invitation = pgTable('invitation', {
  id: uuid('id').defaultRandom().primaryKey(),
  churchId: uuid('church_id')
    .notNull()
    .references(() => church.id, { onDelete: 'cascade' }),
  email: text('email').notNull(),
  role: text('role').notNull(),
  status: text('status').notNull(), // 'pending', 'accepted', 'rejected'
  expiresAt: timestamp('expires_at').notNull(),
  inviterId: uuid('inviter_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  archivedAt: archiveAtColumn(),
});

export const invitationRelations = relations(invitation, ({ one }) => ({
  church: one(church, {
    fields: [invitation.churchId],
    references: [church.id],
  }),
  inviter: one(user, {
    fields: [invitation.inviterId],
    references: [user.id],
  }),
}));
