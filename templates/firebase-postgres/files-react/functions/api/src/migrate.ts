/**
 * Database Migration Script
 *
 * Run with: npm run migrate
 * Creates the initial database schema using Drizzle.
 */

import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function runMigrations() {
  console.log('Running migrations...');

  const db = drizzle(pool);

  // Run migrations from the drizzle folder
  await migrate(db, { migrationsFolder: './drizzle' });

  console.log('Migrations complete!');
  await pool.end();
}

runMigrations().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});