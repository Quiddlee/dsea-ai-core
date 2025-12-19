import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../schema';

export const DrizzleAsyncProvider = 'DrizzleAsyncProvider';

export const drizzleProvider = [
  {
    provide: DrizzleAsyncProvider,
    useFactory: async () => {
      const connectionString = process.env.DATABASE_URL;
      const pool = new Pool({
        connectionString,
      });

      return drizzle(pool, { schema }) as NodePgDatabase<typeof schema>;
    },
  },
];
