ALTER TABLE "member" ADD COLUMN IF NOT EXISTS "age_group" text;
ALTER TABLE "member" ADD COLUMN IF NOT EXISTS "is_visitor" boolean DEFAULT false NOT NULL;
