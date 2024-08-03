import { PrismaClient } from '@prisma/client';
import { IS_HOSTED } from '@/config';

export const prisma = new PrismaClient({
  log: IS_HOSTED ? ['warn', 'error'] : ['warn', 'error'],
});
