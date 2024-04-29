/*
  Warnings:

  - You are about to drop the column `accessToken` on the `PlaidAccount` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `PlaidAccount` table. All the data in the column will be lost.
  - Added the required column `accessTokenId` to the `PlaidAccount` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "PlaidAccount" DROP CONSTRAINT "PlaidAccount_userId_fkey";

-- DropIndex
DROP INDEX "plaid_account_access_token_index";

-- AlterTable
ALTER TABLE "PlaidAccount" DROP COLUMN "accessToken",
DROP COLUMN "userId",
ADD COLUMN     "accessTokenId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "PlaidAccountAccess" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlaidAccountAccess_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PlaidAccountAccess_id_key" ON "PlaidAccountAccess"("id");

-- AddForeignKey
ALTER TABLE "PlaidAccountAccess" ADD CONSTRAINT "PlaidAccountAccess_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlaidAccount" ADD CONSTRAINT "PlaidAccount_accessTokenId_fkey" FOREIGN KEY ("accessTokenId") REFERENCES "PlaidAccountAccess"("id") ON DELETE CASCADE ON UPDATE CASCADE;
