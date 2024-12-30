/*
  Warnings:

  - You are about to drop the column `appleReceipt` on the `UserBilling` table. All the data in the column will be lost.
  - You are about to drop the column `googleOrderId` on the `UserBilling` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "UserBilling" DROP COLUMN "appleReceipt",
DROP COLUMN "googleOrderId";
