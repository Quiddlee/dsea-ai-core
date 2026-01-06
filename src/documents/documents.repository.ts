import { Inject, Injectable } from '@nestjs/common';
import { Documents, documents } from '../schema';
import { DRIZZLE_ASYNC_PROVIDER } from '../drizzle/drizzle.provider';
import { eq } from 'drizzle-orm';
import type { DocumentStatus, Schema } from '../common/types/db';
import { DOCUMENT_STATUS } from '../common/constants';

@Injectable()
export class DocumentsRepository {
  constructor(
    @Inject(DRIZZLE_ASYNC_PROVIDER)
    private readonly db: Schema,
  ) {}

  async getDocumentById(id: string) {
    return this.db.query.documents.findFirst({
      where: eq(documents.id, id),
    });
  }

  async updateDocumentById(id: string, data: Partial<Documents>) {
    return this.db.update(documents).set(data).where(eq(documents.id, id));
  }

  async updateStatusById(id: string, status: DocumentStatus) {
    return this.updateDocumentById(id, {
      status,
    });
  }

  async setError(id: string, message: string) {
    return this.updateDocumentById(id, {
      status: DOCUMENT_STATUS.FAILED,
      lastError: message,
    });
  }

  async setEmbedded(id: string) {
    return this.updateDocumentById(id, {
      status: DOCUMENT_STATUS.EMBEDDED,
      embeddedAt: new Date(),
    });
  }
}
