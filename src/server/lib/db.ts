import { Pool } from 'pg';
import dotenv from 'dotenv';
import type { QueryResult as PgQueryResult, QueryResultRow } from 'pg';

dotenv.config();

const pool: Pool = new Pool({
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  database: process.env.POSTGRES_DB
});

// Add proper typing to Pool query method
declare module 'pg' {
  interface Pool {
    query<T extends QueryResultRow = any>(text: string, values?: any[]): Promise<PgQueryResult<T>>;
  }
}

export default pool;
