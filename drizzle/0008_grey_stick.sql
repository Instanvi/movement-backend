ALTER TABLE "session" ADD COLUMN "active_organization_id" uuid;--> statement-breakpoint
ALTER TABLE "invitation" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_active_organization_id_church_id_fk" FOREIGN KEY ("active_organization_id") REFERENCES "public"."church"("id") ON DELETE set null ON UPDATE no action;