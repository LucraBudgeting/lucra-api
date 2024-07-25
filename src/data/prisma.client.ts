import { PrismaClient } from '@prisma/client';
import { IS_PRODUCTION } from '@/config';

export const prisma = new PrismaClient({
  log: IS_PRODUCTION ? ['warn', 'error'] : ['warn', 'error'],
});
