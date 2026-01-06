import { Inject, Injectable } from '@nestjs/common';
import { DocumentsRepository } from '../../../documents/documents.repository';
import { LlmService } from '../../../llm/llm.service';
import { DocumentsChunksRepository } from '../../../document-chunks/documentsChunks.repository';
import { generateHash } from '../../../common/helpers/string';
import { DocumentsChunkEmbeddingsRepository } from '../../../document-chunk-embeddings/documentsChunkEmbeddings.repository';
import { DocumentChunkEmbedding, DocumentChunks } from '../../../schema';
import { CreateEmbeddingResponse } from 'openai/resources';
import { appConfiguration } from '../../../common/config/app.config';
import type { AppConfig } from '../../../common/types/environment';

@Injectable()
export class EmbeddingService {
  constructor(
    @Inject(appConfiguration.KEY)
    private readonly appConfig: AppConfig,
    private readonly documentsRepository: DocumentsRepository,
    private readonly documentsChunksRepository: DocumentsChunksRepository,
    private readonly documentsChunkEmbeddingsRepository: DocumentsChunkEmbeddingsRepository,
    private readonly llmService: LlmService,
  ) {}

  async embedDocument(documentId: string) {
    const [chunks, embeddedChunks] = await Promise.all([
      this.documentsChunksRepository.getChunksByDocumentId(documentId),
      this.documentsChunkEmbeddingsRepository.getEmbeddingsByDocumentId(
        documentId,
      ),
    ]);

    const changedContentChunks = this.filterChangedChunks(
      chunks,
      embeddedChunks,
    );

    if (changedContentChunks.length === 0) {
      console.log('[EmbeddingService]: No chunks changed');
      return;
    }

    const contentData = changedContentChunks.map((chunk) => chunk.content);
    const embeddings = await this.llmService.generateEmbeddings(contentData);

    const chunkEmbeddingsData = this.mergeChunksAndEmbeddingsData(
      changedContentChunks,
      embeddings,
    );

    await this.documentsChunkEmbeddingsRepository.replaceEmbeddings(
      chunkEmbeddingsData,
    );

    await this.documentsRepository.setEmbedded(documentId);
  }

  private mergeChunksAndEmbeddingsData(
    chunks: DocumentChunks[],
    embeddings: CreateEmbeddingResponse,
  ) {
    return chunks.map((chunk, i) => {
      const embedding = embeddings.data.at(i)?.embedding as number[];
      const contentHash = generateHash(
        this.appConfig.embedding.model +
          chunk.contentHash +
          this.appConfig.embedding.dimensions,
      );

      return {
        chunkId: chunk.id,
        documentId: chunk.documentId,
        model: this.appConfig.embedding.model,
        embedding,
        contentHash,
      };
    });
  }

  private filterChangedChunks(
    chunks: DocumentChunks[],
    embeddedChunks: DocumentChunkEmbedding[],
  ) {
    return chunks.filter((chunk) => {
      const embeddedChunkContentNewHash = generateHash(
        this.appConfig.embedding.model +
          chunk.contentHash +
          this.appConfig.embedding.dimensions,
      );
      const embeddedChunk = embeddedChunks.find(
        (embeddedChunk) => embeddedChunk.chunkId === chunk.id,
      );

      const isContentChanged =
        embeddedChunkContentNewHash !== embeddedChunk?.contentHash;

      return isContentChanged;
    });
  }
}
