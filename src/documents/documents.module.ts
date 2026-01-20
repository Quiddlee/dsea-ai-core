import { Module } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { DrizzleModule } from '../drizzle/drizzle.module';
import { LlmService } from '../llm/llm.service';
import { DocumentsChunkEmbeddingsRepository } from '../document-chunk-embeddings/documentsChunkEmbeddings.repository';
import { DocumentsRepository } from './documents.repository';

@Module({
  imports: [DrizzleModule],
  controllers: [DocumentsController],
  providers: [
    DocumentsService,
    DocumentsRepository,
    DocumentsChunkEmbeddingsRepository,
    LlmService,
  ],
})
export class DocumentsModule {}
