import { ConfigType } from '@nestjs/config';
import { appConfiguration } from '../config/app.config';

export type AppConfig = ConfigType<typeof appConfiguration>;
