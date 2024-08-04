-- DropForeignKey
ALTER TABLE "UserBilling" DROP CONSTRAINT "UserBilling_userId_fkey";

-- AddForeignKey
ALTER TABLE "UserBilling" ADD CONSTRAINT "UserBilling_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
