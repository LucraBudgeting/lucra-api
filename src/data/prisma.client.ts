import { PrismaClient } from '@prisma/client';
import { NODE_ENV } from '@/config';

const isProduction = NODE_ENV === 'production' || NODE_ENV === 'development';

export const prisma = new PrismaClient({
  log: isProduction ? ['warn', 'error'] : ['query', 'info', 'warn', 'error'],
});
