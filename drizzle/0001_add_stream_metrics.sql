CREATE TABLE "stream_metric" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"platform_id" uuid NOT NULL,
	"viewer_count" integer DEFAULT 0 NOT NULL,
	"platform_status" text NOT NULL,
	"captured_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "stream_metric" ADD CONSTRAINT "stream_metric_platform_id_stream_platform_id_fk" FOREIGN KEY ("platform_id") REFERENCES "public"."stream_platform"("id") ON DELETE cascade ON UPDATE no action;