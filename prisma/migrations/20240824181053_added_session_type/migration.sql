-- CreateEnum
CREATE TYPE "SessionType" AS ENUM ('LOGIN', 'CHECK', 'LOGOUT');

-- AlterTable
ALTER TABLE "UserSession" ADD COLUMN     "sessionType" "SessionType" NOT NULL DEFAULT 'LOGIN';
