import { Pool } from 'pg';

export const pool = new Pool({
  user: process.env.DB_USER || 'clash',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'clash_betting',
  password: process.env.DB_PASSWORD || 'clash',
  port: parseInt(process.env.DB_PORT || '5432'),
});
