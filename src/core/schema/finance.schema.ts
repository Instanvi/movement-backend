import {
  pgTable,
  text,
  timestamp,
  uuid,
  decimal,
  pgEnum,
  boolean,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { archiveAtColumn } from './archive-columns';
import { church } from './church.schema';
import { branch } from './branch.schema';
import { user } from './user.schema';

export const accountTypeEnum = pgEnum('financial_account_type', [
  'asset',
  'liability',
  'equity',
  'revenue',
  'expense',
]);

export const fund = pgTable('fund', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(), // e.g. Building Fund, Missions, General Fund
  description: text('description'),
  churchId: uuid('church_id')
    .notNull()
    .references(() => church.id, { onDelete: 'cascade' }),
  branchId: uuid('branch_id').references(() => branch.id, {
    onDelete: 'set null',
  }),
  targetAmount: decimal('target_amount', { precision: 15, scale: 2 }),
  balance: decimal('balance', { precision: 15, scale: 2 })
    .default('0')
    .notNull(),
  isRestricted: boolean('is_restricted').default(false).notNull(),
  createdBy: uuid('created_by').references(() => user.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  archivedAt: archiveAtColumn(),
});

export const financialAccount = pgTable('financial_account', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  code: text('code'),
  description: text('description'),
  type: accountTypeEnum('type').notNull(),
  churchId: uuid('church_id')
    .notNull()
    .references(() => church.id, { onDelete: 'cascade' }),
  branchId: uuid('branch_id').references(() => branch.id, {
    onDelete: 'set null',
  }),
  fundId: uuid('fund_id').references(() => fund.id, {
    onDelete: 'set null',
  }),
  balance: decimal('balance', { precision: 15, scale: 2 })
    .default('0')
    .notNull(),
  openingBalance: decimal('opening_balance', { precision: 15, scale: 2 })
    .default('0')
    .notNull(),
  openingDate: timestamp('opening_date').defaultNow().notNull(),
  createdBy: uuid('created_by').references(() => user.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  archivedAt: archiveAtColumn(),
});

export const financialCategory = pgTable('financial_category', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  type: accountTypeEnum('type').notNull(),
  churchId: uuid('church_id')
    .notNull()
    .references(() => church.id, { onDelete: 'cascade' }),
  parentId: uuid('parent_id'), // Self-reference for subcategories
  createdBy: uuid('created_by').references(() => user.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  archivedAt: archiveAtColumn(),
});

export const payee = pgTable('payee', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  churchId: uuid('church_id')
    .notNull()
    .references(() => church.id, { onDelete: 'cascade' }),
  type: text('type').default('vendor').notNull(),
  email: text('email'),
  phoneNumber: text('phone_number'),
  address: text('address'),
  createdBy: uuid('created_by').references(() => user.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  archivedAt: archiveAtColumn(),
});

/** Pledge drive / campaign (Gracely “Create campaign”): scoped fund + date window. */
export const pledgeCampaign = pgTable('pledge_campaign', {
  id: uuid('id').defaultRandom().primaryKey(),
  churchId: uuid('church_id')
    .notNull()
    .references(() => church.id, { onDelete: 'cascade' }),
  fundId: uuid('fund_id')
    .notNull()
    .references(() => fund.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date'),
  status: text('status').default('active').notNull(),
  createdBy: uuid('created_by').references(() => user.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  archivedAt: archiveAtColumn(),
});

export const stewardshipPledge = pgTable('stewardship_pledge', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  fundId: uuid('fund_id')
    .notNull()
    .references(() => fund.id, { onDelete: 'cascade' }),
  pledgeCampaignId: uuid('pledge_campaign_id').references(
    () => pledgeCampaign.id,
    {
      onDelete: 'set null',
    },
  ),
  targetAmount: decimal('target_amount', { precision: 15, scale: 2 }).notNull(),
  raisedAmount: decimal('raised_amount', { precision: 15, scale: 2 })
    .default('0')
    .notNull(),
  status: text('status').default('active').notNull(),
  startDate: timestamp('start_date').defaultNow().notNull(),
  endDate: timestamp('end_date'),
  createdBy: uuid('created_by').references(() => user.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  archivedAt: archiveAtColumn(),
});

export const transaction = pgTable('transaction', {
  id: uuid('id').defaultRandom().primaryKey(),
  accountId: uuid('account_id')
    .notNull()
    .references(() => financialAccount.id, { onDelete: 'cascade' }),
  amount: decimal('amount', { precision: 15, scale: 2 }).notNull(),
  description: text('description').notNull(),
  type: text('type').notNull(),
  categoryId: uuid('category_id').references(() => financialCategory.id, {
    onDelete: 'set null',
  }),
  payeeId: uuid('payee_id').references(() => payee.id, {
    onDelete: 'set null',
  }),
  date: timestamp('date').defaultNow().notNull(),
  referenceId: uuid('reference_id'),
  fundId: uuid('fund_id').references(() => fund.id, {
    onDelete: 'set null',
  }),
  createdBy: uuid('created_by').references(() => user.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  archivedAt: archiveAtColumn(),
});

export const pledgeCampaignRelations = relations(
  pledgeCampaign,
  ({ one, many }) => ({
    church: one(church, {
      fields: [pledgeCampaign.churchId],
      references: [church.id],
    }),
    fund: one(fund, {
      fields: [pledgeCampaign.fundId],
      references: [fund.id],
    }),
    pledges: many(stewardshipPledge),
  }),
);

export const fundRelations = relations(fund, ({ many }) => ({
  accounts: many(financialAccount),
  pledges: many(stewardshipPledge),
  pledgeCampaigns: many(pledgeCampaign),
  transactions: many(transaction),
}));

export const financialAccountRelations = relations(
  financialAccount,
  ({ one, many }) => ({
    church: one(church, {
      fields: [financialAccount.churchId],
      references: [church.id],
    }),
    branch: one(branch, {
      fields: [financialAccount.branchId],
      references: [branch.id],
    }),
    fund: one(fund, {
      fields: [financialAccount.fundId],
      references: [fund.id],
    }),
    transactions: many(transaction),
  }),
);

export const financialCategoryRelations = relations(
  financialCategory,
  ({ one, many }) => ({
    church: one(church, {
      fields: [financialCategory.churchId],
      references: [church.id],
    }),
    parent: one(financialCategory, {
      fields: [financialCategory.parentId],
      references: [financialCategory.id],
      relationName: 'subcategory',
    }),
    subcategories: many(financialCategory, {
      relationName: 'subcategory',
    }),
    transactions: many(transaction),
  }),
);

export const payeeRelations = relations(payee, ({ one, many }) => ({
  church: one(church, {
    fields: [payee.churchId],
    references: [church.id],
  }),
  transactions: many(transaction),
}));

export const stewardshipPledgeRelations = relations(
  stewardshipPledge,
  ({ one }) => ({
    user: one(user, {
      fields: [stewardshipPledge.userId],
      references: [user.id],
    }),
    fund: one(fund, {
      fields: [stewardshipPledge.fundId],
      references: [fund.id],
    }),
    pledgeCampaign: one(pledgeCampaign, {
      fields: [stewardshipPledge.pledgeCampaignId],
      references: [pledgeCampaign.id],
    }),
  }),
);

export const transactionRelations = relations(transaction, ({ one }) => ({
  account: one(financialAccount, {
    fields: [transaction.accountId],
    references: [financialAccount.id],
  }),
  fund: one(fund, {
    fields: [transaction.fundId],
    references: [fund.id],
  }),
  category: one(financialCategory, {
    fields: [transaction.categoryId],
    references: [financialCategory.id],
  }),
  payee: one(payee, {
    fields: [transaction.payeeId],
    references: [payee.id],
  }),
}));
