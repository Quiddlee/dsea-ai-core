import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { AppConfig } from './common/types/environment';
import { appConfiguration } from './common/config/app.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get<AppConfig>(appConfiguration.KEY);

  app.useGlobalPipes(new ValidationPipe());

  await app.listen(config.port);
}
bootstrap();
