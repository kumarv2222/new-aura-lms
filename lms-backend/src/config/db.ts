import knex from 'knex';
import { env } from './env';

export const db = knex({
  client: 'mysql2',
  connection: {
    host: env.db.host,
    port: env.db.port,
    database: env.db.name,
    user: env.db.user,
    password: env.db.password,
    ssl: env.db.ssl ? { rejectUnauthorized: false } : undefined,
    typeCast: (field: any, next: any) => {
      if (field.type === 'TINY' && field.length === 1) {
        return field.string() === '1';
      }
      return next();
    },
  },
  pool: { min: 2, max: 10 },
  acquireConnectionTimeout: 10000,
});
