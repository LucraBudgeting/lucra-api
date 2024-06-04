/*
  Warnings:

  - You are about to drop the column `hasPaymentConnected` on the `UserOnboardingStage` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "UserOnboardingStage" DROP COLUMN "hasPaymentConnected",
ADD COLUMN     "isBillingConnected" BOOLEAN NOT NULL DEFAULT false;
