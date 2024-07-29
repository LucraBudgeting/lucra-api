import PgBoss from 'pg-boss';
import { DATABASE_URL } from '@/config';
import { logger } from '../logger';

const boss = new PgBoss({
  connectionString: DATABASE_URL,
});

boss.on('error', (error) => logger.error('pgBoss Error', error));

async function initPgBoss() {
  await boss.start();
  logger.info('pg-boss started');
}

export { boss, initPgBoss };
