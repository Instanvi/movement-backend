import {
  pgTable,
  text,
  timestamp,
  uuid,
  boolean,
  jsonb,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { archiveAtColumn } from './archive-columns';
import { church } from './church.schema';

export const churchSetting = pgTable('church_setting', {
  id: uuid('id').defaultRandom().primaryKey(),
  churchId: uuid('church_id')
    .notNull()
    .unique()
    .references(() => church.id, { onDelete: 'cascade' }),

  // Default Person Settings
  defaultPronouns: boolean('default_pronouns').default(false).notNull(),
  genderOptionType: text('gender_option_type').default('basic').notNull(), // 'basic', 'simple', 'expanded', 'full_list'
  defaultGender: text('default_gender'),

  ageGroups: jsonb('age_groups')
    .default({
      child: true,
      adult: true,
      elder: true,
    })
    .notNull(),
  defaultAgeGroup: text('default_age_group').default('adult').notNull(),

  // Localization Settings
  defaultCurrency: text('default_currency').default('USD').notNull(),
  currencyFormat: text('currency_format').default('en-US').notNull(),
  defaultTimezone: text('default_timezone').default('UTC').notNull(),

  // Communication Settings
  defaultCountryCode: text('default_country_code').default('+1').notNull(),

  // Portal Settings
  portalMemberDirectory: boolean('portal_member_directory')
    .default(false)
    .notNull(),

  // Custom Domain Add-On ($19/mo)
  customDomain: text('custom_domain'),
  customDomainStatus: text('custom_domain_status').default('pending'), // 'pending', 'verified', 'failed'
  customDomainSslEnabled: boolean('custom_domain_ssl_enabled')
    .default(false)
    .notNull(),

  updatedAt: timestamp('updated_at')
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  archivedAt: archiveAtColumn(),
});

export const customField = pgTable('custom_field', {
  id: uuid('id').defaultRandom().primaryKey(),
  churchId: uuid('church_id')
    .notNull()
    .references(() => church.id, { onDelete: 'cascade' }),
  label: text('label').notNull(),
  type: text('type').notNull(), // 'text', 'select', 'date', 'number'
  placeholder: text('placeholder'),
  showOnPortal: boolean('show_on_portal').default(false).notNull(),
  options: jsonb('options'), // JSON array of options for select types
  createdAt: timestamp('created_at').defaultNow().notNull(),
  archivedAt: archiveAtColumn(),
});

export const churchSettingRelations = relations(churchSetting, ({ one }) => ({
  church: one(church, {
    fields: [churchSetting.churchId],
    references: [church.id],
  }),
}));

export const customFieldRelations = relations(customField, ({ one }) => ({
  church: one(church, {
    fields: [customField.churchId],
    references: [church.id],
  }),
}));
