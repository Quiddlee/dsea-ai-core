import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LlmService } from './llm/llm.service';
import { AgentModule } from './agent/agent.module';
import { DrizzleModule } from './drizzle/drizzle.module';

@Module({
  imports: [AgentModule, DrizzleModule],
  controllers: [AppController],
  providers: [AppService, LlmService],
})
export class AppModule {}
