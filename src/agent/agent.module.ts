import { Module } from '@nestjs/common';
import { AgentService } from './agent.service';
import { AgentController } from './agent.controller';
import { LlmService } from '../llm/llm.service';

@Module({
  controllers: [AgentController],
  providers: [AgentService, LlmService],
})
export class AgentModule {}
