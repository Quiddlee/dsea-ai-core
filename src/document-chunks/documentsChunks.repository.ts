import { createHash } from 'node:crypto';
import { Inject, Injectable } from '@nestjs/common';
import { documentChunks, NewDocumentChunks } from '../schema';
import { DRIZZLE_ASYNC_PROVIDER } from '../drizzle/drizzle.provider';
import type { DocumentTypes, Schema } from '../common/types/db';
import { CHUNK_CONFIG } from '../common/constants';
import { eq } from 'drizzle-orm';
import { appConfiguration } from '../common/config/app.config';
import type { AppConfig } from '../common/types/environment';

@Injectable()
export class DocumentsChunksRepository {
  constructor(
    @Inject(appConfiguration.KEY)
    private readonly appConfig: AppConfig,
    @Inject(DRIZZLE_ASYNC_PROVIDER)
    private readonly db: Schema,
  ) {}

  async rebuildChunks(
    documentId: string,
    chunks: string[],
    type: DocumentTypes,
  ) {
    await this.deleteDocumentChunks(documentId);

    const buf: NewDocumentChunks[] = [];
    chunks.forEach((chunk, index) => {
      const contentHash = createHash('sha256').update(chunk).digest('hex');
      const chunkConfig = CHUNK_CONFIG[type];

      buf.push({
        documentId,
        content: chunk,
        contentHash,
        chunkIndex: index,
        metadata: JSON.stringify({
          unit: 'tokens',
          encoding: this.appConfig.chunking.encodingTokenizer,
          size: chunkConfig.size,
          overlap: chunkConfig.overlap,
        }),
      });
    });

    return this.db.insert(documentChunks).values(buf);
  }

  async getChunksByDocumentId(id: string) {
    return this.db.query.documentChunks.findMany({
      where: eq(documentChunks.documentId, id),
    });
  }

  private async deleteDocumentChunks(documentId: string) {
    return this.db
      .delete(documentChunks)
      .where(eq(documentChunks.documentId, documentId));
  }
}
