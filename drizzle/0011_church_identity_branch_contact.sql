ALTER TABLE "branch" ADD COLUMN "email" text;--> statement-breakpoint
ALTER TABLE "branch" ADD COLUMN "website" text;--> statement-breakpoint
ALTER TABLE "church" DROP COLUMN "address";--> statement-breakpoint
ALTER TABLE "church" DROP COLUMN "city";--> statement-breakpoint
ALTER TABLE "church" DROP COLUMN "state";--> statement-breakpoint
ALTER TABLE "church" DROP COLUMN "zip_code";--> statement-breakpoint
ALTER TABLE "church" DROP COLUMN "phone_number";--> statement-breakpoint
ALTER TABLE "church" DROP COLUMN "email";--> statement-breakpoint
ALTER TABLE "church" DROP COLUMN "website";