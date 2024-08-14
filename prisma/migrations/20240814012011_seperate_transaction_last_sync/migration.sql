/*
  Warnings:

  - You are about to drop the column `lastSyncDate` on the `Account` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Account" DROP COLUMN "lastSyncDate",
ADD COLUMN     "balanceLastSyncDate" TIMESTAMP(3),
ADD COLUMN     "transactionLastSyncDate" TIMESTAMP(3);
