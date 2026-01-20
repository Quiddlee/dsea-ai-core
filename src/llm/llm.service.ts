import { Inject, Injectable } from '@nestjs/common';
import { OpenAI } from 'openai';
import type { AppConfig } from '../common/types/environment';
import { appConfiguration } from '../common/config/app.config';
import {
  PDF_TABLE_RAW_TEXT_TO_CHUNKS_PROMPT,
  SYSTEM_PROMPT,
} from './domain/llm.constants';
import { Message, User } from '../schema';
import {
  ONBOARDING_VALIDATION_PROMPT,
  USER_MESSAGE_PLACEHOLDER,
} from '../onboarding/domain/onboarding.constants';
import { MESSAGE_ROLE } from '../messages/domain/messages.enums';
import { createReadStream } from 'node:fs';
import { basename } from 'node:path/posix';

const messageHistoryRoleDictionary = {
  [MESSAGE_ROLE.SYSTEM]: 'system',
  [MESSAGE_ROLE.AGENT]: 'assistant',
  [MESSAGE_ROLE.USER]: 'user',
} as const;

@Injectable()
export class LlmService {
  private readonly client: OpenAI;
  private vectorStore?: OpenAI.VectorStore;

  constructor(
    @Inject(appConfiguration.KEY)
    private readonly appConfig: AppConfig,
  ) {
    this.client = new OpenAI({
      apiKey: this.appConfig.openai.apiKey,
    });
  }

  async generate(userData: User, prompt: string, messagesHistory: Message[]) {
    const userDataPrompt = `Данні користувача - повне імʼя = ${userData.fullName} | група = ${userData.group} | роль = ${userData.role}`;
    const userMessagesHistoryPrompt = messagesHistory.map(
      (message) =>
        ({
          role: messageHistoryRoleDictionary[message.role],
          content: message.content,
        }) as const,
    );
    const vectorStoreId = (await this.getOrCreateVectorStore()).id;

    const response = await this.client.responses.create({
      model: 'gpt-5-nano',
      input: [
        {
          role: 'system',
          content: [
            {
              type: 'input_text',
              text: SYSTEM_PROMPT,
            },
            {
              type: 'input_text',
              text: userDataPrompt,
            },
          ],
        },
        ...userMessagesHistoryPrompt,
        {
          role: 'user',
          content: prompt,
        },
      ],
      tools: [
        {
          type: 'file_search',
          vector_store_ids: [vectorStoreId],
        },
        {
          type: 'mcp',
          server_label: 'dsea-mcp-server',
          server_description:
            'Internal DSEA MCP server exposing document tools.',
          server_url: 'https://unrepressed-guttiform-quinn.ngrok-free.dev/mcp',
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
          role: 'system',
          content: PDF_TABLE_RAW_TEXT_TO_CHUNKS_PROMPT.trim(),
        },
        {
          role: 'user',
          content: text.trim(),
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

  async validateOnboardingData(prompt: string) {
    const response = await this.client.responses.create({
      model: 'gpt-5-nano',
      input: [
        {
          role: 'developer',
          content: ONBOARDING_VALIDATION_PROMPT.replace(
            USER_MESSAGE_PLACEHOLDER,
            prompt,
          ).trim(),
        },
      ],
    });

    return response.output_text;
  }

  async uploadFileToVectorStore(filePath: string) {
    void this.deDuplicateVectorStoreFile(filePath);

    const vectorStore = await this.getOrCreateVectorStore();
    const fileContent = createReadStream(filePath);

    const file = await this.client.files.create({
      file: fileContent,
      purpose: 'assistants',
    });

    await this.client.vectorStores.files.create(vectorStore.id, {
      file_id: file.id,
    });
  }

  async getOrCreateVectorStore() {
    if (this.vectorStore) {
      return this.vectorStore;
    }

    const vectorStores = await this.client.vectorStores.list();
    this.vectorStore = vectorStores.data.at(0);

    if (!this.vectorStore) {
      this.vectorStore = await this.client.vectorStores.create({
        name: this.appConfig.knowledgeBaseVectorStoreName,
      });
    }

    return this.vectorStore;
  }

  private async deDuplicateVectorStoreFile(filePath: string) {
    const storeFileList = await this.client.files.list();
    const fileName = basename(filePath);

    for await (const file of storeFileList) {
      if (file.filename === fileName) {
        this.client.files.delete(file.id);
      }
    }
  }
}
