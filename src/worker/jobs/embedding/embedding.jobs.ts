import { Inject, Injectable } from '@nestjs/common';
import { PgBoss } from 'pg-boss';
import { PG_BOSS_PROVIDER } from '../../providers/pg-boss/pgBoss.provider';
import { EmbeddingService } from './embedding.service';

export const JOB_EMBED_DOCUMENT = 'JOB_EMBED_DOCUMENT';

@Injectable()
export class EmbeddingJobs {
  constructor(
    @Inject(PG_BOSS_PROVIDER)
    private readonly boss: PgBoss,
    private readonly embeddingService: EmbeddingService,
  ) {}

  async register() {
    await this.boss.createQueue(JOB_EMBED_DOCUMENT);

    await this.boss.work(JOB_EMBED_DOCUMENT, async ([job]) => {
      const { documentId } = job.data as { documentId: string };
      await this.embeddingService.embedDocument(documentId);
    });
  }
}
