import { Module } from '@nestjs/common';
import { LlmService } from '../llm/llm.service';
import { UsersRepository } from '../users/users.repository';
import { MessagesRepository } from '../messages/messages.repository';
import { DrizzleModule } from '../drizzle/drizzle.module';

@Module({
  imports: [DrizzleModule],
  providers: [LlmService, UsersRepository, MessagesRepository],
})
export class OnboardingModule {}
