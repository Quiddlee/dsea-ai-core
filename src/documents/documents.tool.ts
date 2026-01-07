import { Injectable } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { Tool } from '@rekog/mcp-nest';
import { z } from 'zod';
import { stringifyJSONSafe } from '../common/helpers/json';

@Injectable()
export class DocumentsTool {
  constructor(private readonly documentsService: DocumentsService) {}

  @Tool({
    name: 'get-document-chunks',
    description:
      'Finds the most relevant document chunks for a query and returns ranked results with similarity scores.',
    parameters: z.object({
      query: z.string(),
    }),
  })
  async getDocumentChunks(query: { query: string }) {
    const data = await this.documentsService.getDocument(query.query);

    if (!data) {
      return {
        isError: true,
        content: [
          {
            type: 'text',
            text: 'No similar guides found for this query.',
          },
        ],
      };
    }

    return {
      content: [
        {
          type: 'text',
          text: stringifyJSONSafe({
            results: data,
          }),
        },
      ],
    };
  }
}
