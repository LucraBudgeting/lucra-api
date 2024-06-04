-- CreateEnum
CREATE TYPE "BudgetFrequency" AS ENUM ('Monthly', 'Weekly', 'Daily');

-- CreateEnum
CREATE TYPE "BudgetCategoryType" AS ENUM ('Income', 'Expense');

-- CreateTable
CREATE TABLE "BudgetCategory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "emoji" TEXT NOT NULL DEFAULT '💸',
    "color" TEXT,
    "budgetFrequency" "BudgetFrequency" NOT NULL DEFAULT 'Monthly',
    "budgetType" "BudgetCategoryType" NOT NULL DEFAULT 'Income',
    "amount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BudgetCategory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BudgetCategory_id_key" ON "BudgetCategory"("id");

-- CreateIndex
CREATE INDEX "budget_category_user_id_index" ON "BudgetCategory"("userId");

-- AddForeignKey
ALTER TABLE "BudgetCategory" ADD CONSTRAINT "BudgetCategory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
