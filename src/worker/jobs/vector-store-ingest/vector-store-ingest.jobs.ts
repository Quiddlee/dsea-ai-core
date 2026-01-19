import { Inject, Injectable } from '@nestjs/common';
import { PgBoss } from 'pg-boss';
import { VectorStoreIngestService } from './vector-store-ingest.service';
import { PG_BOSS_PROVIDER } from '../../providers/pg-boss/pgBoss.provider';

export const JOB_VECTOR_STORE_INGEST = 'JOB_VECTOR_STORE_INGEST';

@Injectable()
export class VectorStoreIngestJobs {
  constructor(
    @Inject(PG_BOSS_PROVIDER)
    private readonly boss: PgBoss,
    private readonly vectorStoreIngestService: VectorStoreIngestService,
  ) {}

  async register() {
    await this.boss.createQueue(JOB_VECTOR_STORE_INGEST);

    await this.boss.work(JOB_VECTOR_STORE_INGEST, async ([job]) => {
      const { documentId } = job.data as { documentId: string };
      await this.vectorStoreIngestService.ingestDocumentToVectorStore(
        documentId,
      );
    });
  }
}
