import { Injectable } from '@nestjs/common';
import { LlmService } from '../llm/llm.service';
import { DocumentsChunkEmbeddingsRepository } from '../document-chunk-embeddings/documentsChunkEmbeddings.repository';

@Injectable()
export class DocumentsService {
  constructor(
    private readonly documentsChunkEmbeddingsRepository: DocumentsChunkEmbeddingsRepository,
    private readonly llmService: LlmService,
  ) {}

  async getDocument(query: string) {
    const embeddingResponse = await this.llmService.generateEmbeddings(query);
    const queryEmbedding = embeddingResponse.data?.at(0)?.embedding;

    if (!queryEmbedding) {
      return console.log(
        '[getDocument]: Something went wrong, missing query vector',
      );
    }

    return this.documentsChunkEmbeddingsRepository.findSimilarChunks(
      queryEmbedding,
    );
  }
}
