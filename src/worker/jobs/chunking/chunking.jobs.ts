import { Inject, Injectable } from '@nestjs/common';
import { PgBoss } from 'pg-boss';
import { ChunkingService } from './chunking.service';
import { PG_BOSS_PROVIDER } from '../../providers/pg-boss/pgBoss.provider';

export const JOB_CHUNK_DOCUMENT = 'JOB_CHUNK_DOCUMENT';

@Injectable()
export class ChunkingJobs {
  constructor(
    @Inject(PG_BOSS_PROVIDER)
    private readonly boss: PgBoss,
    private readonly chunkingService: ChunkingService,
  ) {}

  async register() {
    await this.boss.work(JOB_CHUNK_DOCUMENT, async ([job]) => {
      const { documentId } = job.data as { documentId: string };
      await this.chunkingService.chunkDocument(documentId);
    });
  }
}
