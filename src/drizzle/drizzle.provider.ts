import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../schema';
import { appConfiguration } from '../common/config/app.config';
import { AppConfig } from '../common/types/environment';

export const DRIZZLE_ASYNC_PROVIDER = Symbol('DRIZZLE_ASYNC_PROVIDER');

export const drizzleProvider = [
  {
    provide: DRIZZLE_ASYNC_PROVIDER,
    inject: [appConfiguration.KEY],
    useFactory: async (appConfig: AppConfig) => {
      const connectionString = appConfig.database.url;
      const pool = new Pool({
        connectionString,
      });

      return drizzle(pool, { schema }) as NodePgDatabase<typeof schema>;
    },
  },
];
