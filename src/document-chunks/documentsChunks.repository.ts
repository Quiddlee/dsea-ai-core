import { createHash } from 'node:crypto';
import { Inject, Injectable } from '@nestjs/common';
import { documentChunks } from '../schema';
import { DRIZZLE_ASYNC_PROVIDER } from '../drizzle/drizzle.provider';
import type { DocumentTypes, Schema } from '../common/types/db';
import { CHUNK_CONFIG } from '../common/constants';

@Injectable()
export class DocumentsChunksRepository {
  constructor(
    @Inject(DRIZZLE_ASYNC_PROVIDER)
    private readonly db: Schema,
  ) {}

  async appendChunks(
    documentId: string,
    chunks: string[],
    type: DocumentTypes,
  ) {
    let index = 0;
    for await (const chunk of chunks) {
      await this.append(documentId, chunk, index, type);
      index++;
    }
  }

  private async append(
    documentId: string,
    chunk: string,
    chunkIndex: number,
    type: DocumentTypes,
  ) {
    const contentHash = createHash('sha256').update(chunk).digest('hex');
    const chunkConfig = CHUNK_CONFIG[type];

    return this.db.insert(documentChunks).values({
      documentId,
      content: chunk,
      contentHash,
      chunkIndex,
      metadata: JSON.stringify({
        unit: 'tokens',
        encoding: 'cl100k_base',
        size: chunkConfig.size,
        overlap: chunkConfig.overlap,
      }),
    });
  }
}
