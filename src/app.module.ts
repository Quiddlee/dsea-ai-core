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
import { ConfigModule } from '@nestjs/config';
import { appConfiguration } from './common/config/app.config';
import { APP_GUARD } from '@nestjs/core';
import { AiCoreInternalAuthGuard } from './common/guards/ai-core-internal-auth/ai-core-internal-auth.guard';
import { McpModule } from '@rekog/mcp-nest';
import { DocumentsModule } from './documents/documents.module';
import { DocumentsService } from './documents/documents.service';
import { DocumentsTool } from './documents/documents.tool';
import { GradebookModule } from './gradebook/gradebook.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfiguration],
    }),
    McpModule.forRoot({
      name: 'dsea-mcp-server',
      version: '1.0.0',
    }),
    AgentModule,
    DrizzleModule,
    UsersModule,
    MessagesModule,
    OnboardingModule,
    DocumentsModule,
    GradebookModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AiCoreInternalAuthGuard,
    },
    AppService,
    LlmService,
    OnboardingService,
    UsersRepository,
    MessagesRepository,
    DocumentsRepository,
    DocumentsChunksRepository,
    DocumentsChunkEmbeddingsRepository,
    DocumentsService,
    DocumentsTool,
  ],
})
export class AppModule {}
