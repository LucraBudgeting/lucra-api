-- CreateEnum
CREATE TYPE "BillingPlatform" AS ENUM ('APPLE', 'GOOGLE', 'STRIPE');

-- CreateEnum
CREATE TYPE "BillingStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "UserBilling" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "billingPlatform" "BillingPlatform" NOT NULL,
    "appleReceipt" TEXT,
    "googleOrderId" TEXT,
    "stripeCustomerId" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL,
    "status" "BillingStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserBilling_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserBilling_id_key" ON "UserBilling"("id");

-- CreateIndex
CREATE UNIQUE INDEX "UserBilling_userId_key" ON "UserBilling"("userId");

-- CreateIndex
CREATE INDEX "UserBilling_userId_idx" ON "UserBilling"("userId");

-- CreateIndex
CREATE INDEX "UserBilling_billingPlatform_idx" ON "UserBilling"("billingPlatform");

-- AddForeignKey
ALTER TABLE "UserBilling" ADD CONSTRAINT "UserBilling_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
