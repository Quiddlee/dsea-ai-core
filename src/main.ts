import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { AiCoreInternalAuthGuard } from './common/guards/ai-core-internal-auth/ai-core-internal-auth.guard';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalGuards(new AiCoreInternalAuthGuard());

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
