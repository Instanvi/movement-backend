ALTER TABLE "session" DROP CONSTRAINT "session_active_organization_id_church_id_fk";
--> statement-breakpoint
ALTER TABLE "session" DROP COLUMN "active_organization_id";--> statement-breakpoint
ALTER TABLE "invitation" DROP COLUMN "created_at";