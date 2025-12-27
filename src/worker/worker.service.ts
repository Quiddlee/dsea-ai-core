import { BeforeApplicationShutdown, Inject, Injectable } from '@nestjs/common';
import { PgBoss } from 'pg-boss';
import { PG_BOSS_PROVIDER } from './providers/pg-boss/pgBoss.provider';

@Injectable()
export class WorkerService implements BeforeApplicationShutdown {
  constructor(
    @Inject(PG_BOSS_PROVIDER)
    private readonly boss: PgBoss,
  ) {}

  async run() {}

  async beforeApplicationShutdown() {
    await this.boss.stop();
  }
}
