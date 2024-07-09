import { NODE_ENV } from '@/config';
import { PrismaClient } from '@prisma/client';

const isProduction = NODE_ENV === 'production' || NODE_ENV === 'development';

export const prisma = new PrismaClient({
  log: isProduction ? ['warn', 'error'] : ['query', 'info', 'warn', 'error'],
});
