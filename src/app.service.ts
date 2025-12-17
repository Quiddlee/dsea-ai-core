import { Injectable } from '@nestjs/common';
import { LlmService } from './llm/llm.service';

@Injectable()
export class AppService {
  constructor(private readonly llmService: LlmService) {}

  testLlmService() {
    const response = this.llmService.generate(
      'Write a one-sentence bedtime story about a unicorn.',
    );

    return response;
  }
}
