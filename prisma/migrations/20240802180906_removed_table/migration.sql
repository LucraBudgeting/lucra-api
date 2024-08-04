/*
  Warnings:

  - You are about to drop the `TransactionCategory` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
ALTER TYPE "BudgetCategoryType" ADD VALUE 'Transfer';

-- DropForeignKey
ALTER TABLE "TransactionCategory" DROP CONSTRAINT "TransactionCategory_userId_fkey";

-- AlterTable
ALTER TABLE "BudgetCategory" ADD COLUMN     "categoryStatus" "CategoryStatus" NOT NULL DEFAULT 'Active';

-- DropTable
DROP TABLE "TransactionCategory";

-- DropEnum
DROP TYPE "CategoryCreationSource";
