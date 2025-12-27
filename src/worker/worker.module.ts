import { Module } from '@nestjs/common';
import { WorkerService } from './worker.service';
import { DocumentsRepository } from '../documents/documents.repository';
import { ChunkingService } from './jobs/chunking/chunking.service';
import { DocumentsChunksRepository } from '../document-chunks/documentsChunks.repository';

@Module({
  providers: [
    WorkerService,
    ChunkingService,
    DocumentsRepository,
    DocumentsChunksRepository,
  ],
})
export class WorkerModule {}
