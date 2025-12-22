import { Module } from '@nestjs/common';
import { AgentService } from './agent.service';
import { AgentController } from './agent.controller';
import { LlmService } from '../llm/llm.service';
import { UsersRepository } from '../users/users.repository';
import { OnboardingService } from '../onboarding/onboarding.service';
import { MessagesRepository } from '../messages/messages.repository';
import { DrizzleModule } from '../drizzle/drizzle.module';

@Module({
  imports: [DrizzleModule],
  controllers: [AgentController],
  providers: [
    AgentService,
    LlmService,
    UsersRepository,
    MessagesRepository,
    OnboardingService,
  ],
})
export class AgentModule {}
