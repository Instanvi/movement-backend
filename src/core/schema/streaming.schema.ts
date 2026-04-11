import {
  pgTable,
  text,
  timestamp,
  uuid,
  boolean,
  integer,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { archiveAtColumn } from './archive-columns';
import { church } from './church.schema';
import { branch } from './branch.schema';

export const streamPlatform = pgTable('stream_platform', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(), // 'Facebook Live', 'YouTube Live', 'Twitch', etc.
  isEnabled: boolean('is_enabled').default(true).notNull(),
  rtmpUrl: text('rtmp_url').notNull(),
  streamKey: text('stream_key').notNull(),
  churchId: uuid('church_id')
    .notNull()
    .references(() => church.id, { onDelete: 'cascade' }),
  branchId: uuid('branch_id').references(() => branch.id, {
    onDelete: 'set null',
  }),
  createdById: uuid('created_by_id').notNull(),
  lastStartedAt: timestamp('last_started_at'),
  lastStoppedAt: timestamp('last_stopped_at'),
  status: text('status').default('offline').notNull(), // 'offline', 'live', 'streaming'
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  archivedAt: archiveAtColumn(),
});

export const streamPlatformRelations = relations(
  streamPlatform,
  ({ one, many }) => ({
    church: one(church, {
      fields: [streamPlatform.churchId],
      references: [church.id],
    }),
    branch: one(branch, {
      fields: [streamPlatform.branchId],
      references: [branch.id],
    }),
    metrics: many(streamMetric),
  }),
);

export const streamMetric = pgTable('stream_metric', {
  id: uuid('id').defaultRandom().primaryKey(),
  platformId: uuid('platform_id')
    .notNull()
    .references(() => streamPlatform.id, { onDelete: 'cascade' }),
  viewerCount: integer('viewer_count').default(0).notNull(),
  platformStatus: text('platform_status').notNull(), // 'live', 'buffering', 'offline'
  capturedAt: timestamp('captured_at').defaultNow().notNull(),
  archivedAt: archiveAtColumn(),
});

export const streamMetricRelations = relations(streamMetric, ({ one }) => ({
  platform: one(streamPlatform, {
    fields: [streamMetric.platformId],
    references: [streamPlatform.id],
  }),
}));
