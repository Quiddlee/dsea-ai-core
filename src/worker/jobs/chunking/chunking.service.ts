import { Inject, Injectable } from '@nestjs/common';
import { DocumentsRepository } from '../../../documents/documents.repository';
import path from 'node:path';
import fs from 'node:fs/promises';
import { Documents } from '../../../schema';
import { TokenTextSplitter } from '@langchain/textsplitters';
import { TEXT_SPLITTER_PROVIDER } from '../../providers/text-splitter/textSplitter.provider';
import { DocumentsChunksRepository } from '../../../document-chunks/documentsChunks.repository';
import { DOCUMENT_STATUS, DOCUMENT_TYPE } from '../../../common/constants';

@Injectable()
export class ChunkingService {
  constructor(
    @Inject(TEXT_SPLITTER_PROVIDER)
    private readonly textSplitter: TokenTextSplitter,
    private readonly documentsRepository: DocumentsRepository,
    private readonly documentsChunksRepository: DocumentsChunksRepository,
  ) {}

  async chunkDocument(documentId: string) {
    const doc = await this.documentsRepository.getDocumentById(documentId);

    if (!doc) {
      return console.warn(`Could not find document with id ${documentId}`);
    }

    const docPath = path.resolve(
      path.join('..', process.env.ARTIFACTS_DIR!, doc.rawPath),
    );

    if (doc.mimeType === 'application/pdf') {
      await this.handlePdfChunking(doc);
    }

    if (doc.mimeType === 'text/plain') {
      const content = await this.readFile(docPath);

      if (!content) {
        return console.warn(
          `The content for document with id ${documentId} is missing in the file.`,
        );
      }

      await this.handleTextChunking(documentId, content);
    }

    if (doc.mimeType?.startsWith('image')) {
      await this.handleImageChunking(doc);
    }

    // TODO: queue embedding job
  }

  private async handlePdfChunking(document: Documents) {}

  private async handleTextChunking(documentId: string, content: string) {
    try {
      await this.documentsRepository.updateStatusById(
        documentId,
        DOCUMENT_STATUS.CHUNKING,
      );

      const chunks = await this.textSplitter.splitText(content);

      await this.documentsChunksRepository.rebuildChunks(
        documentId,
        chunks,
        DOCUMENT_TYPE.TEXT,
      );

      await this.documentsRepository.updateStatusById(
        documentId,
        DOCUMENT_STATUS.CHUNKED,
      );
    } catch (e) {
      await this.documentsRepository.setError(documentId, e.message);
    }
  }

  private async handleImageChunking(document: Documents) {}

  private async readFile(path: string) {
    try {
      return await fs.readFile(path, {
        encoding: 'utf8',
      });
    } catch (err) {
      console.error(err);
    }
  }
}
