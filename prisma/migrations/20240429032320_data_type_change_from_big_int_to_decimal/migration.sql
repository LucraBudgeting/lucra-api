/*
  Warnings:

  - Added the required column `plaidLastUpdated` to the `PlaidAccountBalance` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PlaidAccountBalance" ADD COLUMN     "plaidLastUpdated" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "available" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "current" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "limit" SET DATA TYPE DECIMAL(65,30);

-- AlterTable
ALTER TABLE "PlaidTransaction" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(65,30);
