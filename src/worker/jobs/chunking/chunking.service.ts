import { Inject, Injectable } from '@nestjs/common';
import { DocumentsRepository } from '../../../documents/documents.repository';
import { join, resolve } from 'node:path';
import { mkdir, readdir, readFile } from 'node:fs/promises';
import { Documents } from '../../../schema';
import { TokenTextSplitter } from '@langchain/textsplitters';
import { TEXT_SPLITTER_PROVIDER } from '../../providers/text-splitter/textSplitter.provider';
import { DocumentsChunksRepository } from '../../../document-chunks/documentsChunks.repository';
import { DOCUMENT_STATUS, DOCUMENT_TYPE } from '../../../common/constants';
import { PageTableResult, PDFParse } from 'pdf-parse';
import { LlmService } from '../../../llm/llm.service';
import { fromPath } from 'pdf2pic';
import { Options } from 'pdf2pic/dist/types/options';
import { appConfiguration } from '../../../common/config/app.config';
import type { AppConfig } from '../../../common/types/environment';

@Injectable()
export class ChunkingService {
  constructor(
    @Inject(appConfiguration.KEY)
    private readonly appConfig: AppConfig,
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

    const docPath = resolve(
      join('..', this.appConfig.artifactsDir, doc.rawPath),
    );

    if (doc.mimeType === 'application/pdf') {
      await this.handlePdfChunking(documentId /* docPath*/);
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

  async handlePdfChunking(documentId: string /* path: string*/) {
    // const docPath = resolve(
    //   join('..', this.appConfig.artifactsDir, 'raw/508d4b3bfc89178a.pdf'),
    // );
    //
    // const docPath = resolve(
    //   join('..', this.appConfig.artifactsDir, 'raw/e99667332b394b2b.pdf'),
    // );
    const docPath = resolve(
      join('..', this.appConfig.artifactsDir, 'raw/a6c1b6287d850b91.pdf'),
    );

    // const buffer = await readFile(path);
    const buffer = await readFile(docPath);
    const parser = new PDFParse({ data: buffer });
    const res = await parser.getTable();

    const pdfText = await parser.getText();
    console.log(pdfText.text, 'pdf text ayo');

    const isTablesParsed = res.pages.some((page) =>
      Boolean(page.tables.length),
    );
    let chunks: string[] = [];

    if (isTablesParsed) {
      chunks = this.preparePdfTablesForChunking(res.pages);
    } else {
      // ai fallback

      const parsedImagesPath = join(
        '..',
        this.appConfig.artifactsDir,
        'parsed-image',
      );

      await mkdir(parsedImagesPath, { recursive: true });

      const options: Options = {
        density: 200,
        saveFilename: 'page',
        savePath: parsedImagesPath,
        format: 'jpeg',
        width: 1700,
        height: 2200,
        preserveAspectRatio: true,
        quality: 100,
        compression: 'jpeg',
      };

      const ALL_PAGES = -1;
      await fromPath(docPath, options).bulk(ALL_PAGES, {
        responseType: 'image',
      });

      const imageFileNames = await readdir(parsedImagesPath);

      const base64Images = [];
      for await (const imageFileName of imageFileNames) {
        const imagePath = resolve(join(parsedImagesPath, imageFileName));
        const imageBuffer = await readFile(imagePath);
        const base64Image = Buffer.from(imageBuffer).toString('base64');
        base64Images.push(base64Image);
      }

      console.log('start llm request');
      // const llmRes = await this.llmService.preparePdfTableImagesForChunking(
      //   pdfText.text,
      // );
      /*
      const queue: Set<Promise<string>> = new Set();

      for await (const base64Image of base64Images) {
        const promise = this.llmService.preparePdfTableImagesForChunking([
          base64Image,
        ]);
        queue.add(promise);
      }

      const res = await Promise.all(queue);
      console.log('end llm request');

      console.log(res, 'llm res');

      console.log('start chunks array fill');

 */
      // console.log(llmRes);
      // mockResponse.forEach((chunk) => {
      //   const rows = chunk.split('\n').filter((row) => row.trim() !== '');
      //
      //   if (rows.length) {
      //     chunks.push(...rows);
      //   }
      // });

      // await rm(parsedImagesPath, { recursive: true, force: true });
    }
    console.log('start db write');
    /*
    await this.documentsRepository.updateStatusById(
      documentId,
      DOCUMENT_STATUS.CHUNKING,
    );

    await this.documentsChunksRepository.rebuildChunks(
      documentId,
      chunks,
      DOCUMENT_TYPE.PDF,
    );

    await this.documentsRepository.updateStatusById(
      documentId,
      DOCUMENT_STATUS.CHUNKED,
    );

    console.log('end db write');

 */
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
      return await readFile(path, {
        encoding: 'utf8',
      });
    } catch (err) {
      console.error(err);
    }
  }

  private preparePdfTablesForChunking(pages: PageTableResult[]) {
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
