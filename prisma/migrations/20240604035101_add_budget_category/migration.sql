/*
  Warnings:

  - The values [Income,Expense] on the enum `BudgetCategoryType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "BudgetCategoryType_new" AS ENUM ('Debit', 'Credit');
ALTER TABLE "BudgetCategory" ALTER COLUMN "budgetType" DROP DEFAULT;
ALTER TABLE "BudgetCategory" ALTER COLUMN "budgetType" TYPE "BudgetCategoryType_new" USING ("budgetType"::text::"BudgetCategoryType_new");
ALTER TYPE "BudgetCategoryType" RENAME TO "BudgetCategoryType_old";
ALTER TYPE "BudgetCategoryType_new" RENAME TO "BudgetCategoryType";
DROP TYPE "BudgetCategoryType_old";
ALTER TABLE "BudgetCategory" ALTER COLUMN "budgetType" SET DEFAULT 'Debit';
COMMIT;

-- AlterTable
ALTER TABLE "BudgetCategory" ALTER COLUMN "budgetType" SET DEFAULT 'Debit';
