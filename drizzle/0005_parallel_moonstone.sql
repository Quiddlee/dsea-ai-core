CREATE TABLE "document_chunk_embeddings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"chunk_id" uuid NOT NULL,
	"document_id" uuid NOT NULL,
	"model" text NOT NULL,
	"embedding" vector(1536) NOT NULL,
	"content_hash" text NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "document_chunk_embeddings" ADD CONSTRAINT "document_chunk_embeddings_chunk_id_document_chunks_id_fk" FOREIGN KEY ("chunk_id") REFERENCES "public"."document_chunks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_chunk_embeddings" ADD CONSTRAINT "document_chunk_embeddings_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "chunk_embeddings_uq" ON "document_chunk_embeddings" USING btree ("chunk_id","model","content_hash");--> statement-breakpoint
CREATE INDEX "chunk_embeddings_chunk_id_idx" ON "document_chunk_embeddings" USING btree ("chunk_id");--> statement-breakpoint
CREATE INDEX "chunk_embeddings_model_idx" ON "document_chunk_embeddings" USING btree ("model");--> statement-breakpoint
CREATE INDEX "chunk_embeddings_embedding_hnsw_idx" ON "document_chunk_embeddings" USING hnsw ("embedding" vector_cosine_ops);