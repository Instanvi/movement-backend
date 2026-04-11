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
ALTER TABLE "pledge_campaign" ADD CONSTRAINT "pledge_campaign_church_id_church_id_fk" FOREIGN KEY ("church_id") REFERENCES "public"."church"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pledge_campaign" ADD CONSTRAINT "pledge_campaign_fund_id_fund_id_fk" FOREIGN KEY ("fund_id") REFERENCES "public"."fund"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stewardship_pledge" ADD COLUMN "pledge_campaign_id" uuid;--> statement-breakpoint
ALTER TABLE "stewardship_pledge" ADD CONSTRAINT "stewardship_pledge_pledge_campaign_id_pledge_campaign_id_fk" FOREIGN KEY ("pledge_campaign_id") REFERENCES "public"."pledge_campaign"("id") ON DELETE set null ON UPDATE no action;
