import { Inject, Injectable } from '@nestjs/common';
import { ChatAgentDto } from './dto/chat-agent.dto';
import { LlmService } from '../llm/llm.service';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as sc from '../schema';
import { DrizzleAsyncProvider } from 'src/drizzle/drizzle.provider';

@Injectable()
export class AgentService {
  constructor(
    @Inject(DrizzleAsyncProvider)
    private db: NodePgDatabase<typeof sc>,
    private readonly llmService: LlmService,
  ) {}

  handleQuery({ message }: ChatAgentDto) {
    return this.llmService.generate(message);
  }
}
