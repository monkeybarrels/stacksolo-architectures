/**
 * Database Connection
 *
 * Drizzle ORM with PostgreSQL.
 */

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Cloud SQL uses Unix socket in production
  ...(process.env.NODE_ENV === 'production' &&
    process.env.CLOUD_SQL_CONNECTION_NAME && {
      host: `/cloudsql/${process.env.CLOUD_SQL_CONNECTION_NAME}`,
    }),
});

export const db = drizzle(pool, { schema });

export { pool };