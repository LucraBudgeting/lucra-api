/*
  Warnings:

  - You are about to drop the column `categories` on the `PlaidTransaction` table. All the data in the column will be lost.
  - You are about to drop the column `categories` on the `Transaction` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PlaidTransaction" DROP COLUMN "categories",
ADD COLUMN     "categoryConfidenceLevel" TEXT,
ADD COLUMN     "categoryDetailed" TEXT,
ADD COLUMN     "categoryPrimary" TEXT;

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "categories",
ADD COLUMN     "categoryConfidenceLevel" TEXT,
ADD COLUMN     "categoryDetailed" TEXT,
ADD COLUMN     "categoryPrimary" TEXT;
