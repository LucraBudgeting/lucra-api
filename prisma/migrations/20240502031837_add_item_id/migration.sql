/*
  Warnings:

  - Added the required column `itemId` to the `PlaidAccountAccess` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PlaidAccountAccess" ADD COLUMN     "itemId" TEXT NOT NULL;
