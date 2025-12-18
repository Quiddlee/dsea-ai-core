import { Injectable } from '@nestjs/common';
import { ChatAgentDto } from './dto/chat-agent.dto';
import { LlmService } from '../llm/llm.service';

@Injectable()
export class AgentService {
  constructor(private readonly llmService: LlmService) {}

  handleQuery({ message }: ChatAgentDto) {
    return this.llmService.generate(message);
  }
}
