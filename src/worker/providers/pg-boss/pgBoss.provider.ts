import { PgBoss } from 'pg-boss';
import { AppConfig } from '../../../common/types/environment';
import { appConfiguration } from '../../../common/config/app.config';

export const PG_BOSS_PROVIDER = Symbol('PG_BOSS_PROVIDER');

export const pgBossProvider = [
  {
    provide: PG_BOSS_PROVIDER,
    inject: [appConfiguration.KEY],
    useFactory: async (appConfig: AppConfig) => {
      const boss = new PgBoss({
        connectionString: appConfig.database.url,
      });

      boss.on('error', console.error);

      await boss.start();

      process.on('SIGTERM', async () => boss.stop());
      process.on('SIGINT', async () => boss.stop());

      return boss;
    },
  },
];
