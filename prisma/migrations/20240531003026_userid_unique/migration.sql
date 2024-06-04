/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `PlaidAccountAccess` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId]` on the table `TransactionCategory` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId]` on the table `UserOnboardingStage` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId]` on the table `UserSession` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "PlaidAccountAccess_userId_key" ON "PlaidAccountAccess"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "TransactionCategory_userId_key" ON "TransactionCategory"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserOnboardingStage_userId_key" ON "UserOnboardingStage"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserSession_userId_key" ON "UserSession"("userId");
