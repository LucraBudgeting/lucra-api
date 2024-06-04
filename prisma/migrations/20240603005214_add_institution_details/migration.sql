/*
  Warnings:

  - You are about to drop the column `institutionId` on the `PlaidAccount` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "plaid_account_institution_id_index";

-- AlterTable
ALTER TABLE "PlaidAccount" DROP COLUMN "institutionId",
ADD COLUMN     "bankInstitutionId" TEXT;

-- CreateTable
CREATE TABLE "BankInstitution" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT,
    "name" TEXT,
    "website" TEXT,
    "primaryColor" TEXT,
    "logo" TEXT,
    "country" "Country" NOT NULL DEFAULT 'USA',
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BankInstitution_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BankInstitution_id_key" ON "BankInstitution"("id");

-- CreateIndex
CREATE INDEX "plaid_account_bank_institution_id_index" ON "PlaidAccount"("bankInstitutionId");

-- AddForeignKey
ALTER TABLE "PlaidAccount" ADD CONSTRAINT "PlaidAccount_bankInstitutionId_fkey" FOREIGN KEY ("bankInstitutionId") REFERENCES "BankInstitution"("id") ON DELETE CASCADE ON UPDATE CASCADE;
