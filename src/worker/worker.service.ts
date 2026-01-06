import { BeforeApplicationShutdown, Inject, Injectable } from '@nestjs/common';
import { PgBoss } from 'pg-boss';
import { PG_BOSS_PROVIDER } from './providers/pg-boss/pgBoss.provider';
import { ChunkingJobs } from './jobs/chunking/chunking.jobs';
import { EmbeddingJobs } from './jobs/embedding/embedding.jobs';

@Injectable()
export class WorkerService implements BeforeApplicationShutdown {
  constructor(
    @Inject(PG_BOSS_PROVIDER)
    private readonly boss: PgBoss,
    private readonly chunkingJobs: ChunkingJobs,
    private readonly embeddingJobs: EmbeddingJobs,
  ) {}

  async run() {
    await this.chunkingJobs.register();
    await this.embeddingJobs.register();
  }

  async beforeApplicationShutdown() {
    await this.boss.stop();
  }
}
