import { Inject, Injectable } from '@nestjs/common';
import { DRIZZLE_ASYNC_PROVIDER } from '../drizzle/drizzle.provider';
import type { Schema } from '../common/types/db';
import {
  documentChunkEmbeddings,
  documentChunks,
  NewDocumentChunkEmbedding,
} from '../schema';
import { cosineDistance, desc, eq, gt, inArray, sql } from 'drizzle-orm';

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

  async findSimilarChunks(
    queryEmbedding: number[],
    threshold: number = 0.3,
    limit: number = 10,
  ) {
    const similarity = sql<number>`1 - (${cosineDistance(documentChunkEmbeddings.embedding, queryEmbedding)})`;

    const similarGuides = await this.db
      .select({ content: documentChunks.content, similarity })
      .from(documentChunkEmbeddings)
      .where(gt(similarity, threshold))
      .innerJoin(
        documentChunks,
        eq(documentChunkEmbeddings.chunkId, documentChunks.id),
      )
      .orderBy(desc(similarity))
      .limit(limit);

    return similarGuides;
  }

  private async deleteByChunkIds(ids: string[]) {
    return this.db
      .delete(documentChunkEmbeddings)
      .where(inArray(documentChunkEmbeddings.chunkId, ids));
  }
}
