import { user } from './user.schema';
import {
  boolean,
  pgTable,
  text,
  timestamp,
  uuid,
  jsonb,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { archiveAtColumn } from './archive-columns';
import { church } from './church.schema';
import { branch } from './branch.schema';
import { member } from './member.schema';

export const groupVisibilityEnum = pgEnum('group_visibility', [
  'private',
  'public',
  'team',
]);

export const groupEnrollmentEnum = pgEnum('group_enrollment', [
  'open',
  'closed',
]);

export const group = pgTable('group', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  churchId: uuid('church_id')
    .notNull()
    .references(() => church.id, { onDelete: 'cascade' }),
  branchId: uuid('branch_id').references(() => branch.id, {
    onDelete: 'set null',
  }),
  visibility: groupVisibilityEnum('visibility').default('private').notNull(),
  /** Open vs closed enrollment (Gracely-style). */
  enrollment: groupEnrollmentEnum('enrollment').default('open').notNull(),
  location: text('location'),
  /** Free-text schedule, e.g. "Every Thursday and Friday". */
  meetupSummary: text('meetup_summary'),
  iconUrl: text('icon_url'),
  criteria: jsonb('criteria'), // For future dynamic group logic
  createdBy: uuid('created_by').references(() => user.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  archivedAt: archiveAtColumn(),
});

export const groupMember = pgTable('group_member', {
  id: uuid('id').defaultRandom().primaryKey(),
  groupId: uuid('group_id')
    .notNull()
    .references(() => group.id, { onDelete: 'cascade' }),
  memberId: uuid('member_id')
    .notNull()
    .references(() => member.id, { onDelete: 'cascade' }),
  isLeader: boolean('is_leader').default(false).notNull(),
  joinedAt: timestamp('joined_at').defaultNow().notNull(),
  archivedAt: archiveAtColumn(),
});

export const groupRelations = relations(group, ({ one, many }) => ({
  church: one(church, {
    fields: [group.churchId],
    references: [church.id],
  }),
  branch: one(branch, {
    fields: [group.branchId],
    references: [branch.id],
  }),
  members: many(groupMember),
}));

export const groupMemberRelations = relations(groupMember, ({ one }) => ({
  group: one(group, {
    fields: [groupMember.groupId],
    references: [group.id],
  }),
  member: one(member, {
    fields: [groupMember.memberId],
    references: [member.id],
  }),
}));
