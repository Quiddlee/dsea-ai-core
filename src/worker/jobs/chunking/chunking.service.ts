import { Inject, Injectable } from '@nestjs/common';
import { DocumentsRepository } from '../../../documents/documents.repository';
import path from 'node:path';
import fs from 'node:fs/promises';
import { Documents } from '../../../schema';
import { TokenTextSplitter } from '@langchain/textsplitters';
import { TEXT_SPLITTER_PROVIDER } from '../../providers/text-splitter/textSplitter.provider';
import { DocumentsChunksRepository } from '../../../document-chunks/documentsChunks.repository';
import { DOCUMENT_STATUS, DOCUMENT_TYPE } from '../../../common/constants';
import { PageTableResult, PDFParse } from 'pdf-parse';
import { LlmService } from '../../../llm/llm.service';

@Injectable()
export class ChunkingService {
  constructor(
    @Inject(TEXT_SPLITTER_PROVIDER)
    private readonly textSplitter: TokenTextSplitter,
    private readonly documentsRepository: DocumentsRepository,
    private readonly documentsChunksRepository: DocumentsChunksRepository,
    private readonly llmService: LlmService,
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
      await this.handlePdfChunking(/*doc*/);
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

  async handlePdfChunking(/*path: string*/) {
    const docPath = path.resolve(
      path.join('..', process.env.ARTIFACTS_DIR!, 'raw/508d4b3bfc89178a.pdf'),
    );

    // const docPath = path.resolve(
    //   path.join('..', process.env.ARTIFACTS_DIR!, 'raw/e99667332b394b2b.pdf'),
    // );

    const buffer = await fs.readFile(docPath);
    const parser = new PDFParse({ data: buffer });
    const res = await parser.getTable();

    const isTableParsed = res.pages.some((page) => Boolean(page.tables.length));
    let buff: string[] = [];

    if (isTableParsed) {
      buff = this.preparePdfTableForChunking(res.pages);
    } else {
      // this.llmService;
      // ai fallback
    }

    console.log(buff);

    // const allSplits = await this.textSplitter.splitDocuments(doc);
  }

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

  private preparePdfTableForChunking(pages: PageTableResult[]) {
    const buff: string[] = [];

    const tableContentMap = pages
      .at(0)
      ?.tables?.at(0)
      ?.at(0)
      ?.map((cell) =>
        cell.replaceAll('-\n', '').replaceAll('\n', ' ').toLowerCase(),
      );

    // remove tableContentMap
    pages.at(0)?.tables?.at(0)?.shift();

    pages.forEach((page) => {
      page.tables.forEach((table) => {
        table.forEach((row) => {
          // ignore near empty rows
          const notDataRow = row.filter(Boolean).length < 3;

          if (notDataRow) {
            return;
          }

          const contentRows = row
            .map((val, i) => {
              const key = tableContentMap?.[i];

              if (val && key) {
                return `${key}=${val}`;
              }

              return null;
            })
            .filter(Boolean);

          const rowString = contentRows.join(' | ');
          buff.push(rowString);
        });
      });
    });

    return buff;
  }
}
