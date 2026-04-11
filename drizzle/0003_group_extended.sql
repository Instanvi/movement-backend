CREATE TYPE "public"."group_enrollment" AS ENUM('open', 'closed');--> statement-breakpoint
ALTER TABLE "group" ADD COLUMN "location" text;--> statement-breakpoint
ALTER TABLE "group" ADD COLUMN "meetup_summary" text;--> statement-breakpoint
ALTER TABLE "group" ADD COLUMN "icon_url" text;--> statement-breakpoint
ALTER TABLE "group" ADD COLUMN "enrollment" "group_enrollment" DEFAULT 'open' NOT NULL;--> statement-breakpoint
ALTER TABLE "group_member" ADD COLUMN "is_leader" boolean DEFAULT false NOT NULL;
