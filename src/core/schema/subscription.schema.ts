import {
  pgTable,
  text,
  timestamp,
  uuid,
  pgEnum,
  boolean,
  jsonb,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { archiveAtColumn } from './archive-columns';
import { church } from './church.schema';

export const subscriptionStatusEnum = pgEnum('subscription_status', [
  'active',
  'canceled',
  'incomplete',
  'incomplete_expired',
  'past_due',
  'trialing',
  'unpaid',
  'paused',
]);

export const subscriptionPlanEnum = pgEnum('subscription_plan', [
  'free',
  'standard',
  'pro',
]);

export const subscription = pgTable('subscription', {
  id: uuid('id').defaultRandom().primaryKey(),
  churchId: uuid('church_id')
    .notNull()
    .references(() => church.id, { onDelete: 'cascade' }),
  stripeSubscriptionId: text('stripe_subscription_id').unique(),
  stripeCustomerId: text('stripe_customer_id'),
  stripePriceId: text('stripe_price_id'),
  status: subscriptionStatusEnum('status').notNull().default('incomplete'),
  plan: subscriptionPlanEnum('plan').notNull().default('free'),
  cancelAtPeriodEnd: boolean('cancel_at_period_end').notNull().default(false),
  currentPeriodStart: timestamp('current_period_start'),
  currentPeriodEnd: timestamp('current_period_end'),
  trialStart: timestamp('trial_start'),
  trialEnd: timestamp('trial_end'),
  endedAt: timestamp('ended_at'),
  cancelAt: timestamp('cancel_at'),
  canceledAt: timestamp('canceled_at'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  archivedAt: archiveAtColumn(),
});

export const billingHistory = pgTable('billing_history', {
  id: uuid('id').defaultRandom().primaryKey(),
  churchId: uuid('church_id')
    .notNull()
    .references(() => church.id, { onDelete: 'cascade' }),
  amount: text('amount').notNull(),
  status: text('status').notNull(), // 'paid', 'failed', 'pending'
  invoiceUrl: text('invoice_url'),
  date: timestamp('date').defaultNow().notNull(),
  type: text('type').default('subscription').notNull(), // 'subscription', 'sms_credit'
  archivedAt: archiveAtColumn(),
});

export const integration = pgTable('integration', {
  id: uuid('id').defaultRandom().primaryKey(),
  churchId: uuid('church_id')
    .notNull()
    .references(() => church.id, { onDelete: 'cascade' }),
  provider: text('provider').notNull(), // 'paypal', 'stripe', 'quickbooks', 'mailchimp', 'checkr'
  status: text('status').default('disconnected').notNull(),
  config: jsonb('config'),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  archivedAt: archiveAtColumn(),
});

export const subscriptionRelations = relations(subscription, ({ one }) => ({
  church: one(church, {
    fields: [subscription.churchId],
    references: [church.id],
  }),
}));
