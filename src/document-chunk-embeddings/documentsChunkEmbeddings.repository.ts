import { Inject, Injectable } from '@nestjs/common';
import { DRIZZLE_ASYNC_PROVIDER } from '../drizzle/drizzle.provider';
import type { Schema } from '../common/types/db';
import { documentChunkEmbeddings, NewDocumentChunkEmbedding } from '../schema';
import { eq, inArray } from 'drizzle-orm';

@Injectable()
export class DocumentsChunkEmbeddingsRepository {
  constructor(
    @Inject(DRIZZLE_ASYNC_PROVIDER)
    private readonly db: Schema,
  ) {}

  async replaceEmbeddings(embeddings: NewDocumentChunkEmbedding[]) {
    const idsToDelete = embeddings.map((emb) => emb.chunkId);
    await this.deleteByChunkIds(idsToDelete);
    return this.db.insert(documentChunkEmbeddings).values(embeddings);
  }

  async getEmbeddingsByDocumentId(id: string) {
    return this.db.query.documentChunkEmbeddings.findMany({
      where: eq(documentChunkEmbeddings.documentId, id),
    });
  }

  private async deleteByChunkIds(ids: string[]) {
    return this.db
      .delete(documentChunkEmbeddings)
      .where(inArray(documentChunkEmbeddings.chunkId, ids));
  }
}
