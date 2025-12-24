CREATE TABLE "documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source_type" text NOT NULL,
	"source_id" text NOT NULL,
	"url" text,
	"title" text,
	"mime_type" text,
	"checksum" text NOT NULL,
	"status" text DEFAULT 'DISCOVERED' NOT NULL,
	"last_error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"parsed_at" timestamp with time zone,
	"embedded_at" timestamp with time zone
);
--> statement-breakpoint
CREATE UNIQUE INDEX "documents_source_uq" ON "documents" USING btree ("source_type","source_id");--> statement-breakpoint
CREATE INDEX "documents_status_idx" ON "documents" USING btree ("status");--> statement-breakpoint
CREATE INDEX "documents_updated_at_idx" ON "documents" USING btree ("updated_at");