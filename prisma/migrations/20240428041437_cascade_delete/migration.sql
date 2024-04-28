-- DropForeignKey
ALTER TABLE "PlaidAccount" DROP CONSTRAINT "PlaidAccount_userId_fkey";

-- DropForeignKey
ALTER TABLE "PlaidAccountBalance" DROP CONSTRAINT "PlaidAccountBalance_accountId_fkey";

-- DropForeignKey
ALTER TABLE "PlaidTransaction" DROP CONSTRAINT "PlaidTransaction_accountId_fkey";

-- DropForeignKey
ALTER TABLE "PlaidTransaction" DROP CONSTRAINT "PlaidTransaction_addressId_fkey";

-- DropForeignKey
ALTER TABLE "PlaidTransactionTransactionCategory" DROP CONSTRAINT "PlaidTransactionTransactionCategory_plaidTransactionId_fkey";

-- DropForeignKey
ALTER TABLE "PlaidTransactionTransactionCategory" DROP CONSTRAINT "PlaidTransactionTransactionCategory_transactionCategoryId_fkey";

-- DropForeignKey
ALTER TABLE "TransactionCategory" DROP CONSTRAINT "TransactionCategory_userId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_addressId_fkey";

-- DropForeignKey
ALTER TABLE "UserAuth" DROP CONSTRAINT "UserAuth_userId_fkey";

-- DropForeignKey
ALTER TABLE "UserSession" DROP CONSTRAINT "UserSession_userId_fkey";

-- DropForeignKey
ALTER TABLE "UserSessionAccess" DROP CONSTRAINT "UserSessionAccess_sessionId_fkey";

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "Address"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAuth" ADD CONSTRAINT "UserAuth_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSession" ADD CONSTRAINT "UserSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSessionAccess" ADD CONSTRAINT "UserSessionAccess_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "UserSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlaidAccount" ADD CONSTRAINT "PlaidAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlaidAccountBalance" ADD CONSTRAINT "PlaidAccountBalance_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "PlaidAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlaidTransaction" ADD CONSTRAINT "PlaidTransaction_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "PlaidAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlaidTransaction" ADD CONSTRAINT "PlaidTransaction_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "Address"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransactionCategory" ADD CONSTRAINT "TransactionCategory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlaidTransactionTransactionCategory" ADD CONSTRAINT "PlaidTransactionTransactionCategory_plaidTransactionId_fkey" FOREIGN KEY ("plaidTransactionId") REFERENCES "PlaidTransaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlaidTransactionTransactionCategory" ADD CONSTRAINT "PlaidTransactionTransactionCategory_transactionCategoryId_fkey" FOREIGN KEY ("transactionCategoryId") REFERENCES "TransactionCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
