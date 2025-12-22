import { Module } from '@nestjs/common';
import { DRIZZLE_ASYNC_PROVIDER, drizzleProvider } from './drizzle.provider';

@Module({
  providers: [...drizzleProvider],
  exports: [DRIZZLE_ASYNC_PROVIDER],
})
export class DrizzleModule {}
