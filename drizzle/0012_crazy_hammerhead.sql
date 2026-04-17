CREATE TYPE "public"."time_of_day" AS ENUM('morning', 'evening');--> statement-breakpoint
CREATE TABLE "devotional" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"church_id" uuid NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"scripture_reference" text,
	"scripture_text" text,
	"author" text,
	"image_url" text,
	"publish_date" date NOT NULL,
	"time_of_day" time_of_day DEFAULT 'morning' NOT NULL,
	"prayer_points" text,
	"confession" text,
	"further_reading" text,
	"reading_plan" text,
	"created_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"archived_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "stream_metric" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "stream_platform" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "stream_metric" CASCADE;--> statement-breakpoint
DROP TABLE "stream_platform" CASCADE;--> statement-breakpoint
ALTER TABLE "church" ADD COLUMN "created_by" uuid;--> statement-breakpoint
ALTER TABLE "member" ADD COLUMN "created_by" uuid;--> statement-breakpoint
ALTER TABLE "branch" ADD COLUMN "created_by" uuid;--> statement-breakpoint
ALTER TABLE "donation" ADD COLUMN "created_by" uuid;--> statement-breakpoint
ALTER TABLE "project" ADD COLUMN "created_by" uuid;--> statement-breakpoint
ALTER TABLE "messaging" ADD COLUMN "created_by" uuid;--> statement-breakpoint
ALTER TABLE "batch" ADD COLUMN "created_by" uuid;--> statement-breakpoint
ALTER TABLE "appointment_booking" ADD COLUMN "created_by" uuid;--> statement-breakpoint
ALTER TABLE "appointment_type" ADD COLUMN "created_by" uuid;--> statement-breakpoint
ALTER TABLE "calendar_event" ADD COLUMN "created_by" uuid;--> statement-breakpoint
ALTER TABLE "follow_up" ADD COLUMN "created_by" uuid;--> statement-breakpoint
ALTER TABLE "resource" ADD COLUMN "created_by" uuid;--> statement-breakpoint
ALTER TABLE "room" ADD COLUMN "created_by" uuid;--> statement-breakpoint
ALTER TABLE "custom_field" ADD COLUMN "created_by" uuid;--> statement-breakpoint
ALTER TABLE "announcement" ADD COLUMN "created_by" uuid;--> statement-breakpoint
ALTER TABLE "form" ADD COLUMN "created_by" uuid;--> statement-breakpoint
ALTER TABLE "family" ADD COLUMN "created_by" uuid;--> statement-breakpoint
ALTER TABLE "financial_account" ADD COLUMN "created_by" uuid;--> statement-breakpoint
ALTER TABLE "financial_category" ADD COLUMN "created_by" uuid;--> statement-breakpoint
ALTER TABLE "fund" ADD COLUMN "created_by" uuid;--> statement-breakpoint
ALTER TABLE "payee" ADD COLUMN "created_by" uuid;--> statement-breakpoint
ALTER TABLE "pledge_campaign" ADD COLUMN "created_by" uuid;--> statement-breakpoint
ALTER TABLE "stewardship_pledge" ADD COLUMN "created_by" uuid;--> statement-breakpoint
ALTER TABLE "transaction" ADD COLUMN "created_by" uuid;--> statement-breakpoint
ALTER TABLE "group" ADD COLUMN "created_by" uuid;--> statement-breakpoint
ALTER TABLE "subscription" ADD COLUMN "created_by" uuid;--> statement-breakpoint
ALTER TABLE "devotional" ADD CONSTRAINT "devotional_church_id_church_id_fk" FOREIGN KEY ("church_id") REFERENCES "public"."church"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "devotional" ADD CONSTRAINT "devotional_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "church" ADD CONSTRAINT "church_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member" ADD CONSTRAINT "member_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "branch" ADD CONSTRAINT "branch_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "donation" ADD CONSTRAINT "donation_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project" ADD CONSTRAINT "project_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messaging" ADD CONSTRAINT "messaging_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "batch" ADD CONSTRAINT "batch_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointment_booking" ADD CONSTRAINT "appointment_booking_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointment_type" ADD CONSTRAINT "appointment_type_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calendar_event" ADD CONSTRAINT "calendar_event_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "follow_up" ADD CONSTRAINT "follow_up_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resource" ADD CONSTRAINT "resource_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "room" ADD CONSTRAINT "room_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "custom_field" ADD CONSTRAINT "custom_field_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "announcement" ADD CONSTRAINT "announcement_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form" ADD CONSTRAINT "form_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "family" ADD CONSTRAINT "family_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "financial_account" ADD CONSTRAINT "financial_account_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "financial_category" ADD CONSTRAINT "financial_category_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fund" ADD CONSTRAINT "fund_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payee" ADD CONSTRAINT "payee_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pledge_campaign" ADD CONSTRAINT "pledge_campaign_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stewardship_pledge" ADD CONSTRAINT "stewardship_pledge_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "group" ADD CONSTRAINT "group_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscription" ADD CONSTRAINT "subscription_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;