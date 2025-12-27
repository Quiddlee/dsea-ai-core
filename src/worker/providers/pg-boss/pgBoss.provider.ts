import { PgBoss } from 'pg-boss';

export const PG_BOSS_PROVIDER = Symbol('PG_BOSS_PROVIDER');

export const pgBossProvider = [
  {
    provide: PG_BOSS_PROVIDER,
    useFactory: async () => {
      const boss = new PgBoss({
        connectionString: process.env.DATABASE_URL!,
      });

      await boss.start();

      process.on('SIGTERM', async () => boss.stop());
      process.on('SIGINT', async () => boss.stop());

      return boss;
    },
  },
];
