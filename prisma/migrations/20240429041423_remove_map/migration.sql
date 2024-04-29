/*
  Warnings:

  - You are about to drop the column `accessTokenId` on the `PlaidAccount` table. All the data in the column will be lost.
  - Added the required column `accessAccountId` to the `PlaidAccount` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "PlaidAccount" DROP CONSTRAINT "PlaidAccount_accessTokenId_fkey";

-- AlterTable
ALTER TABLE "PlaidAccount" DROP COLUMN "accessTokenId",
ADD COLUMN     "accessAccountId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "PlaidAccount" ADD CONSTRAINT "PlaidAccount_accessAccountId_fkey" FOREIGN KEY ("accessAccountId") REFERENCES "PlaidAccountAccess"("id") ON DELETE CASCADE ON UPDATE CASCADE;
