import PgBoss from 'pg-boss';
import { DATABASE_URL } from '@/config';
import { logger } from '../logger';

const boss = new PgBoss({
  connectionString: DATABASE_URL,
});

boss.on('error', (error) => logger.error('pgBoss Error', error));

async function initPgBoss() {
  try {
    await boss.start();
    logger.info('pg-boss started');
  } catch (error) {
    logger.error('pg-boss failed to start', error);
  }
}

export { boss, initPgBoss };
