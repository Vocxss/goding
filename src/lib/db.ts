import { Pool, QueryResult, QueryResultRow } from "pg";
import "server-only";

const pool = () => {
  return new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 50,
    idleTimeoutMillis: 30000,
  });
}

export async function query<T extends QueryResultRow = any>(
  text: string,
  params?: unknown[]
): Promise<QueryResult<T>> {
  return pool().query<T>(text, params);
}

export default pool;