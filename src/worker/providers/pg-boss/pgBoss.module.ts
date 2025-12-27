import { Module } from '@nestjs/common';
import { PG_BOSS_PROVIDER, pgBossProvider } from './pgBoss.provider';

@Module({
  providers: [...pgBossProvider],
  exports: [PG_BOSS_PROVIDER],
})
export class PgBossModule {}
