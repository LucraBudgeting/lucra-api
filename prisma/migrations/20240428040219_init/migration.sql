-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('Active_Paid', 'Suspended', 'InActive', 'Deleted', 'Active_Demo');

-- CreateEnum
CREATE TYPE "Country" AS ENUM ('USA', 'Canada');

-- CreateEnum
CREATE TYPE "CategoryCreationSource" AS ENUM ('UserCreated', 'PlaidCreated');

-- CreateEnum
CREATE TYPE "CategoryStatus" AS ENUM ('Ignore', 'Active');

-- CreateEnum
CREATE TYPE "IsoCurrencyCode" AS ENUM ('USD');

-- CreateEnum
CREATE TYPE "PaymentChannel" AS ENUM ('InStore', 'Online', 'Other');

-- CreateEnum
CREATE TYPE "AccountTypes" AS ENUM ('Checking', 'Savings', 'CreditCard', 'Loan', 'Investment', 'Mortgage', 'Other');

-- CreateTable
CREATE TABLE "SeedHash" (
    "id" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SeedHash_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "addressId" TEXT,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "lastName" TEXT,
    "status" "UserStatus" NOT NULL DEFAULT 'Active_Demo',
    "country" "Country" NOT NULL DEFAULT 'USA',
    "firstName" TEXT NOT NULL,
    "phoneNumber" TEXT,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserAuth" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "passwordHash" TEXT,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserAuth_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSessionAccess" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "deviceType" TEXT NOT NULL,
    "operatingSystem" TEXT NOT NULL,
    "sessionIpAddress" TEXT NOT NULL,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserSessionAccess_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlaidAccount" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "institutionDisplayName" TEXT NOT NULL,
    "institutionOfficialName" TEXT,
    "institutionId" TEXT,
    "type" "AccountTypes" NOT NULL DEFAULT 'Other',
    "mask" TEXT NOT NULL DEFAULT '0000',
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlaidAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlaidAccountBalance" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "available" BIGINT NOT NULL,
    "current" BIGINT NOT NULL,
    "limit" BIGINT,
    "isoCurrency" "IsoCurrencyCode" NOT NULL DEFAULT 'USD',
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlaidAccountBalance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlaidTransaction" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "amount" BIGINT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isoCurrencyCode" "IsoCurrencyCode" NOT NULL DEFAULT 'USD',
    "merchantName" TEXT,
    "name" TEXT,
    "pending" BOOLEAN NOT NULL DEFAULT false,
    "paymentChannel" "PaymentChannel" NOT NULL DEFAULT 'Other',
    "addressId" TEXT,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlaidTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransactionCategory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdSource" "CategoryCreationSource" NOT NULL DEFAULT 'UserCreated',
    "status" "CategoryStatus" NOT NULL DEFAULT 'Ignore',
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TransactionCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlaidTransactionTransactionCategory" (
    "id" TEXT NOT NULL,
    "plaidTransactionId" TEXT NOT NULL,
    "transactionCategoryId" TEXT NOT NULL,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlaidTransactionTransactionCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Address" (
    "id" TEXT NOT NULL,
    "street1" TEXT NOT NULL,
    "street2" TEXT,
    "city" TEXT,
    "postalCode" TEXT,
    "country" "Country" NOT NULL DEFAULT 'USA',
    "lat" TEXT,
    "lng" TEXT,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SeedHash_id_key" ON "SeedHash"("id");

-- CreateIndex
CREATE UNIQUE INDEX "User_id_key" ON "User"("id");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UserAuth_id_key" ON "UserAuth"("id");

-- CreateIndex
CREATE UNIQUE INDEX "UserSession_id_key" ON "UserSession"("id");

-- CreateIndex
CREATE UNIQUE INDEX "UserSessionAccess_id_key" ON "UserSessionAccess"("id");

-- CreateIndex
CREATE UNIQUE INDEX "PlaidAccount_id_key" ON "PlaidAccount"("id");

-- CreateIndex
CREATE INDEX "access_token_index" ON "PlaidAccount"("accessToken");

-- CreateIndex
CREATE UNIQUE INDEX "PlaidAccountBalance_id_key" ON "PlaidAccountBalance"("id");

-- CreateIndex
CREATE UNIQUE INDEX "PlaidTransaction_id_key" ON "PlaidTransaction"("id");

-- CreateIndex
CREATE UNIQUE INDEX "TransactionCategory_id_key" ON "TransactionCategory"("id");

-- CreateIndex
CREATE UNIQUE INDEX "PlaidTransactionTransactionCategory_id_key" ON "PlaidTransactionTransactionCategory"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Address_id_key" ON "Address"("id");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "Address"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAuth" ADD CONSTRAINT "UserAuth_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSession" ADD CONSTRAINT "UserSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSessionAccess" ADD CONSTRAINT "UserSessionAccess_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "UserSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlaidAccount" ADD CONSTRAINT "PlaidAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlaidAccountBalance" ADD CONSTRAINT "PlaidAccountBalance_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "PlaidAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlaidTransaction" ADD CONSTRAINT "PlaidTransaction_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "PlaidAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlaidTransaction" ADD CONSTRAINT "PlaidTransaction_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "Address"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransactionCategory" ADD CONSTRAINT "TransactionCategory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlaidTransactionTransactionCategory" ADD CONSTRAINT "PlaidTransactionTransactionCategory_plaidTransactionId_fkey" FOREIGN KEY ("plaidTransactionId") REFERENCES "PlaidTransaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlaidTransactionTransactionCategory" ADD CONSTRAINT "PlaidTransactionTransactionCategory_transactionCategoryId_fkey" FOREIGN KEY ("transactionCategoryId") REFERENCES "TransactionCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
