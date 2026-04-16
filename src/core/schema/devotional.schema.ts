import { user } from './user.schema';
import {
  pgTable,
  text,
  timestamp,
  uuid,
  date,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { archiveAtColumn } from './archive-columns';
import { church } from './church.schema';

export const timeOfDayEnum = pgEnum('time_of_day', ['morning', 'evening']);

export const devotional = pgTable('devotional', {
  id: uuid('id').defaultRandom().primaryKey(),
  churchId: uuid('church_id')
    .notNull()
    .references(() => church.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  content: text('content').notNull(),
  scriptureReference: text('scripture_reference'),
  scriptureText: text('scripture_text'),
  author: text('author'),
  imageUrl: text('image_url'),
  publishDate: date('publish_date').notNull(),
  timeOfDay: timeOfDayEnum('time_of_day').default('morning').notNull(),
  prayerPoints: text('prayer_points'),
  confession: text('confession'),
  furtherReading: text('further_reading'),
  readingPlan: text('reading_plan'),
  createdBy: uuid('created_by').references(() => user.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  archivedAt: archiveAtColumn(),
});

export const devotionalRelations = relations(devotional, ({ one }) => ({
  church: one(church, {
    fields: [devotional.churchId],
    references: [church.id],
  }),
}));
