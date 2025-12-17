import { Injectable } from '@nestjs/common';
import { OpenAI } from 'openai';

@Injectable()
export class LlmService {
  private readonly client = new OpenAI();

  async generate(prompt: string) {
    const response = await this.client.responses.create({
      model: 'gpt-5-nano',
      input: prompt,
    });

    return response;
  }
}
