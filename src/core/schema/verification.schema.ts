import { pgTable, text, timestamp, uuid, index } from 'drizzle-orm/pg-core';
import { archiveAtColumn } from './archive-columns';

export const verification = pgTable(
  'verification',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    archivedAt: archiveAtColumn(),
  },
  (table) => [index('verification_identifier_idx').on(table.identifier)],
);
