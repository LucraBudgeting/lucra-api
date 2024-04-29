-- AlterTable
ALTER TABLE "PlaidAccount" ADD COLUMN     "subType" TEXT,
ALTER COLUMN "mask" DROP NOT NULL;
