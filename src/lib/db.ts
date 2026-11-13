import {Pool} from "pg"

export default function pool() {
  return new Pool({
    connectionString: process.env.DATABASE_URL,
  });
}