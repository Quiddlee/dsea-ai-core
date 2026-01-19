import { Inject, Injectable } from '@nestjs/common';
import { DocumentsRepository } from '../../../documents/documents.repository';
import { join, resolve } from 'node:path';
import { LlmService } from '../../../llm/llm.service';
import { appConfiguration } from '../../../common/config/app.config';
import type { AppConfig } from '../../../common/types/environment';

@Injectable()
export class VectorStoreIngestService {
  constructor(
    @Inject(appConfiguration.KEY)
    private readonly appConfig: AppConfig,
    private readonly documentsRepository: DocumentsRepository,
    private readonly llmService: LlmService,
  ) {}

  async ingestDocumentToVectorStore(documentId: string) {
    const doc = await this.documentsRepository.getDocumentById(documentId);

    if (!doc) {
      return console.warn(`Could not find document with id ${documentId}`);
    }

    if (doc.mimeType?.startsWith('image')) {
      return console.warn('Skipping image file');
    }

    const docPath = resolve(
      join('..', this.appConfig.artifactsDir, doc.rawPath),
    );

    return await this.llmService.uploadFileToVectorStore(docPath);
  }
}
