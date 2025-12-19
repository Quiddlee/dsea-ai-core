import { Module } from '@nestjs/common';
import { AgentService } from './agent.service';
import { AgentController } from './agent.controller';
import { LlmService } from '../llm/llm.service';
import { DrizzleModule } from '../drizzle/drizzle.module';

@Module({
  imports: [DrizzleModule],
  controllers: [AgentController],
  providers: [AgentService, LlmService],
})
export class AgentModule {}
