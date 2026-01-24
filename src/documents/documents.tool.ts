import { Injectable } from '@nestjs/common';
import { Tool } from '@rekog/mcp-nest';
import { z } from 'zod';
import { DocumentsService } from './documents.service';

const getDocumentByNameSchema = z.object({
  name: z.string(),
});

type GetDocumentByNameParams = z.infer<typeof getDocumentByNameSchema>;

@Injectable()
export class DocumentsTool {
  constructor(private readonly documentsService: DocumentsService) {}

  @Tool({
    name: 'get-document-by-name',
    description:
      'Finds a document by its title and returns metadata. Useful to provide source data for the user.',
    parameters: getDocumentByNameSchema,
  })
  async getDocumentByName({ name }: GetDocumentByNameParams) {
    const document = await this.documentsService.getDocumentByTitle(name);

    if (!document) {
      return {
        isError: true,
        message: 'No document found with the provided name.',
      };
    }

    return {
      isError: false,
      data: {
        id: document.id,
        title: document.title,
        url: document.url,
        mimeType: document.mimeType,
        rawPath: document.rawPath,
      },
    };
  }
}
