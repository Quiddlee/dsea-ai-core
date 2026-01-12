import { Inject, Injectable } from '@nestjs/common';
import { OpenAI } from 'openai';
import type { AppConfig } from '../common/types/environment';
import { appConfiguration } from '../common/config/app.config';
import { PDF_TABLE_RAW_TEXT_TO_CHUNKS_PROMPT } from './domain/llm.constants';

@Injectable()
export class LlmService {
  private readonly client: OpenAI;

  constructor(
    @Inject(appConfiguration.KEY)
    private readonly appConfig: AppConfig,
  ) {
    this.client = new OpenAI({
      apiKey: this.appConfig.openai.apiKey,
    });
  }

  async generate(prompt: string) {
    const response = await this.client.responses.create({
      model: 'gpt-5-nano',
      input: prompt,
      tools: [
        {
          type: 'mcp',
          server_label: 'dsea-mcp-server',
          server_description:
            'Internal DSEA MCP server exposing document search and scheduling tools.',
          server_url: 'http://localhost:3000/mcp',
          require_approval: 'never',
          headers: {
            'x-ai-core-token': this.appConfig.aiCoreInternalToken as string,
          },
        },
      ],
    });

    return response.output_text;
  }

  async preparePdfTableRawTextForChunking(text: string) {
    const response = await this.client.responses.create({
      model: 'gpt-5-nano',
      input: [
        {
          role: 'user',
          content: [
            {
              type: 'input_text',
              text: PDF_TABLE_RAW_TEXT_TO_CHUNKS_PROMPT.trim(),
            },
            {
              type: 'input_text',
              text: text.trim(),
            },
          ],
        },
      ],
    });

    return response.output_text;
  }

  async generateEmbeddings(str: string | string[]) {
    return this.client.embeddings.create({
      model: this.appConfig.embedding.model,
      dimensions: this.appConfig.embedding.dimensions,
      input: str,
      encoding_format: 'float',
    });
  }
}
