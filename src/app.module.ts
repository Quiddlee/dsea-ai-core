import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LlmService } from './llm/llm.service';
import { AgentModule } from './agent/agent.module';
import { DrizzleModule } from './drizzle/drizzle.module';
import { OnboardingService } from './onboarding/onboarding.service';
import { UsersModule } from './users/users.module';
import { MessagesModule } from './messages/messages.module';
import { OnboardingModule } from './onboarding/onboarding.module';
import { UsersRepository } from './users/users.repository';
import { MessagesRepository } from './messages/messages.repository';
import { DocumentsRepository } from './documents/documents.repository';
import { DocumentsChunksRepository } from './document-chunks/documentsChunks.repository';
import { DocumentsChunkEmbeddingsRepository } from './document-chunk-embeddings/documentsChunkEmbeddings.repository';

@Module({
  imports: [
    AgentModule,
    DrizzleModule,
    UsersModule,
    MessagesModule,
    OnboardingModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    LlmService,
    OnboardingService,
    UsersRepository,
    MessagesRepository,
    DocumentsRepository,
    DocumentsChunksRepository,
    DocumentsChunkEmbeddingsRepository,
  ],
})
export class AppModule {}
