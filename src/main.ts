import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { AiCoreInternalAuthGuard } from './common/guards/ai-core-internal-auth/ai-core-internal-auth.guard';
import { AppConfig } from './common/types/environment';
import { appConfiguration } from './common/config/app.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get<AppConfig>(appConfiguration.KEY);
  const aiCoreInternalAuthGuard = app.get(AiCoreInternalAuthGuard);

  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalGuards(aiCoreInternalAuthGuard);

  await app.listen(config.port);
}
bootstrap();
