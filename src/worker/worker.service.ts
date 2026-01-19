import { BeforeApplicationShutdown, Inject, Injectable } from '@nestjs/common';
import { PgBoss } from 'pg-boss';
import { PG_BOSS_PROVIDER } from './providers/pg-boss/pgBoss.provider';
import { VectorStoreIngestJobs } from './jobs/vector-store-ingest/vector-store-ingest.jobs';

@Injectable()
export class WorkerService implements BeforeApplicationShutdown {
  constructor(
    @Inject(PG_BOSS_PROVIDER)
    private readonly boss: PgBoss,
    // private readonly chunkingJobs: ChunkingJobs,
    // private readonly embeddingJobs: EmbeddingJobs,
    private readonly vectorStoreIngestJobs: VectorStoreIngestJobs,
  ) {}

  async run() {
    await this.vectorStoreIngestJobs.register();
    // await this.chunkingJobs.register();
    // await this.embeddingJobs.register();
  }

  async beforeApplicationShutdown() {
    await this.boss.stop();
  }
}
