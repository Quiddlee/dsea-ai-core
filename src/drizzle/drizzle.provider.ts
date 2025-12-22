import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../schema';

export const DRIZZLE_ASYNC_PROVIDER = 'DRIZZLE_ASYNC_PROVIDER';

export const drizzleProvider = [
  {
    provide: DRIZZLE_ASYNC_PROVIDER,
    useFactory: async () => {
      const connectionString = process.env.DATABASE_URL;
      const pool = new Pool({
        connectionString,
      });

      return drizzle(pool, { schema }) as NodePgDatabase<typeof schema>;
    },
  },
];
