import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LlmService } from './llm/llm.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, LlmService],
})
export class AppModule {}
