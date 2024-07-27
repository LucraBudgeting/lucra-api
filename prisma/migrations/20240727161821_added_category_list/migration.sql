-- AlterTable
ALTER TABLE "PlaidTransaction" ADD COLUMN     "categories" JSONB DEFAULT '[]';

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "categories" JSONB DEFAULT '[]';
