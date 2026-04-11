CREATE TYPE "public"."group_enrollment" AS ENUM('open', 'closed');--> statement-breakpoint
CREATE TABLE "pledge_campaign" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"church_id" uuid NOT NULL,
	"fund_id" uuid NOT NULL,
	"name" text NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"archived_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "account" ADD COLUMN "archived_at" timestamp;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "archived_at" timestamp;--> statement-breakpoint
ALTER TABLE "session" ADD COLUMN "archived_at" timestamp;--> statement-breakpoint
ALTER TABLE "verification" ADD COLUMN "archived_at" timestamp;--> statement-breakpoint
ALTER TABLE "church" ADD COLUMN "archived_at" timestamp;--> statement-breakpoint
ALTER TABLE "member" ADD COLUMN "age_group" text;--> statement-breakpoint
ALTER TABLE "member" ADD COLUMN "is_visitor" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "member" ADD COLUMN "archived_at" timestamp;--> statement-breakpoint
ALTER TABLE "invitation" ADD COLUMN "archived_at" timestamp;--> statement-breakpoint
ALTER TABLE "branch" ADD COLUMN "archived_at" timestamp;--> statement-breakpoint
ALTER TABLE "donation" ADD COLUMN "archived_at" timestamp;--> statement-breakpoint
ALTER TABLE "project" ADD COLUMN "archived_at" timestamp;--> statement-breakpoint
ALTER TABLE "project_item" ADD COLUMN "archived_at" timestamp;--> statement-breakpoint
ALTER TABLE "messaging" ADD COLUMN "archived_at" timestamp;--> statement-breakpoint
ALTER TABLE "batch" ADD COLUMN "archived_at" timestamp;--> statement-breakpoint
ALTER TABLE "appointment_booking" ADD COLUMN "archived_at" timestamp;--> statement-breakpoint
ALTER TABLE "appointment_schedule" ADD COLUMN "archived_at" timestamp;--> statement-breakpoint
ALTER TABLE "appointment_type" ADD COLUMN "archived_at" timestamp;--> statement-breakpoint
ALTER TABLE "calendar_event" ADD COLUMN "archived_at" timestamp;--> statement-breakpoint
ALTER TABLE "follow_up" ADD COLUMN "archived_at" timestamp;--> statement-breakpoint
ALTER TABLE "resource" ADD COLUMN "archived_at" timestamp;--> statement-breakpoint
ALTER TABLE "room" ADD COLUMN "archived_at" timestamp;--> statement-breakpoint
ALTER TABLE "church_setting" ADD COLUMN "archived_at" timestamp;--> statement-breakpoint
ALTER TABLE "custom_field" ADD COLUMN "archived_at" timestamp;--> statement-breakpoint
ALTER TABLE "announcement" ADD COLUMN "archived_at" timestamp;--> statement-breakpoint
ALTER TABLE "form" ADD COLUMN "archived_at" timestamp;--> statement-breakpoint
ALTER TABLE "form_submission" ADD COLUMN "archived_at" timestamp;--> statement-breakpoint
ALTER TABLE "family" ADD COLUMN "archived_at" timestamp;--> statement-breakpoint
ALTER TABLE "financial_account" ADD COLUMN "archived_at" timestamp;--> statement-breakpoint
ALTER TABLE "financial_category" ADD COLUMN "archived_at" timestamp;--> statement-breakpoint
ALTER TABLE "fund" ADD COLUMN "archived_at" timestamp;--> statement-breakpoint
ALTER TABLE "payee" ADD COLUMN "archived_at" timestamp;--> statement-breakpoint
ALTER TABLE "stewardship_pledge" ADD COLUMN "pledge_campaign_id" uuid;--> statement-breakpoint
ALTER TABLE "stewardship_pledge" ADD COLUMN "archived_at" timestamp;--> statement-breakpoint
ALTER TABLE "transaction" ADD COLUMN "archived_at" timestamp;--> statement-breakpoint
ALTER TABLE "group" ADD COLUMN "enrollment" "group_enrollment" DEFAULT 'open' NOT NULL;--> statement-breakpoint
ALTER TABLE "group" ADD COLUMN "location" text;--> statement-breakpoint
ALTER TABLE "group" ADD COLUMN "meetup_summary" text;--> statement-breakpoint
ALTER TABLE "group" ADD COLUMN "icon_url" text;--> statement-breakpoint
ALTER TABLE "group" ADD COLUMN "archived_at" timestamp;--> statement-breakpoint
ALTER TABLE "group_member" ADD COLUMN "is_leader" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "group_member" ADD COLUMN "archived_at" timestamp;--> statement-breakpoint
ALTER TABLE "stream_metric" ADD COLUMN "archived_at" timestamp;--> statement-breakpoint
ALTER TABLE "stream_platform" ADD COLUMN "archived_at" timestamp;--> statement-breakpoint
ALTER TABLE "billing_history" ADD COLUMN "archived_at" timestamp;--> statement-breakpoint
ALTER TABLE "integration" ADD COLUMN "archived_at" timestamp;--> statement-breakpoint
ALTER TABLE "subscription" ADD COLUMN "archived_at" timestamp;--> statement-breakpoint
ALTER TABLE "pledge_campaign" ADD CONSTRAINT "pledge_campaign_church_id_church_id_fk" FOREIGN KEY ("church_id") REFERENCES "public"."church"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pledge_campaign" ADD CONSTRAINT "pledge_campaign_fund_id_fund_id_fk" FOREIGN KEY ("fund_id") REFERENCES "public"."fund"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stewardship_pledge" ADD CONSTRAINT "stewardship_pledge_pledge_campaign_id_pledge_campaign_id_fk" FOREIGN KEY ("pledge_campaign_id") REFERENCES "public"."pledge_campaign"("id") ON DELETE set null ON UPDATE no action;