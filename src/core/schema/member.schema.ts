import {
  boolean,
  pgTable,
  text,
  timestamp,
  uuid,
  pgEnum,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { archiveAtColumn } from './archive-columns';
import { church } from './church.schema';
import { user } from './user.schema';
import { branch } from './branch.schema';
import { family } from './family.schema';

export const memberRoleEnum = pgEnum('member_role', [
  'admin',
  'pastor',
  'member',
  'overseer',
]);

export const familyMemberRoleEnum = pgEnum('family_member_role', [
  'Head of House',
  'Spouse',
  'Child',
  'Relative',
  'Other',
]);

export const genderEnum = pgEnum('gender', ['Male', 'Female', 'Other']);

export const maritalStatusEnum = pgEnum('marital_status', [
  'Single',
  'Married',
  'Divorced',
  'Widowed',
  'Unspecified',
]);

export const member = pgTable(
  'member',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    churchId: uuid('church_id')
      .notNull()
      .references(() => church.id, { onDelete: 'cascade' }),
    branchId: uuid('branch_id').references(() => branch.id, {
      onDelete: 'set null',
    }),
    userId: uuid('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    familyId: uuid('family_id').references(() => family.id, {
      onDelete: 'set null',
    }),
    role: memberRoleEnum('role').default('member').notNull(),
    familyRole: familyMemberRoleEnum('family_role').default('Other').notNull(),
    gender: genderEnum('gender').default('Other').notNull(),
    maritalStatus: maritalStatusEnum('marital_status')
      .default('Unspecified')
      .notNull(),
    birthDate: timestamp('birth_date'),
    phoneNumber: text('phone_number'),
    /** UI age band (e.g. Adult, Child) — optional. */
    ageGroup: text('age_group'),
    isVisitor: boolean('is_visitor').default(false).notNull(),
    status: text('status').default('new').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    archivedAt: archiveAtColumn(),
  },
  (table) => {
    return {
      churchBranchUserUnique: uniqueIndex('member_church_branch_user_idx').on(
        table.churchId,
        table.branchId,
        table.userId,
      ),
    };
  },
);

export const memberRelations = relations(member, ({ one }) => ({
  church: one(church, {
    fields: [member.churchId],
    references: [church.id],
  }),
  branch: one(branch, {
    fields: [member.branchId],
    references: [branch.id],
  }),
  user: one(user, {
    fields: [member.userId],
    references: [user.id],
  }),
  family: one(family, {
    fields: [member.familyId],
    references: [family.id],
  }),
}));
