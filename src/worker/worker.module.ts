import { Module } from '@nestjs/common';
import { WorkerService } from './worker.service';
import { DocumentsRepository } from '../documents/documents.repository';
import { ChunkingService } from './jobs/chunking/chunking.service';
import { DocumentsChunksRepository } from '../document-chunks/documentsChunks.repository';
import { PgBossModule } from './providers/pg-boss/pgBoss.module';
import { TextSplitterModule } from './providers/text-splitter/textSplitter.module';
import { DrizzleModule } from '../drizzle/drizzle.module';
import { ChunkingJobs } from './jobs/chunking/chunking.jobs';
import { LlmService } from '../llm/llm.service';
import { EmbeddingService } from './jobs/embedding/embedding.service';
import { EmbeddingJobs } from './jobs/embedding/embedding.jobs';
import { DocumentsChunkEmbeddingsRepository } from '../document-chunk-embeddings/documentsChunkEmbeddings.repository';

@Module({
  imports: [PgBossModule, TextSplitterModule, DrizzleModule],
  providers: [
    WorkerService,
    ChunkingService,
    ChunkingJobs,
    DocumentsRepository,
    DocumentsChunksRepository,
    LlmService,
    EmbeddingService,
    EmbeddingJobs,
    DocumentsChunkEmbeddingsRepository,
  ],
})
export class WorkerModule {}
