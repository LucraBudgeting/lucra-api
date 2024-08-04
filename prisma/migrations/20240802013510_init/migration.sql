-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('Active_Paid', 'Suspended', 'InActive', 'Deleted', 'Active_Demo', 'Onboarding_UnPaid', 'Onboarding_Paid');

-- CreateEnum
CREATE TYPE "RuleModels" AS ENUM ('Transaction');

-- CreateEnum
CREATE TYPE "Country" AS ENUM ('USA', 'Canada');

-- CreateEnum
CREATE TYPE "CategoryCreationSource" AS ENUM ('UserCreated', 'PlaidCreated');

-- CreateEnum
CREATE TYPE "CategoryStatus" AS ENUM ('Ignore', 'Active');

-- CreateEnum
CREATE TYPE "BudgetFrequency" AS ENUM ('Monthly', 'Weekly', 'Daily');

-- CreateEnum
CREATE TYPE "BudgetCategoryType" AS ENUM ('Debit', 'Credit');

-- CreateEnum
CREATE TYPE "IsoCurrencyCode" AS ENUM ('USD');

-- CreateEnum
CREATE TYPE "PaymentChannel" AS ENUM ('InStore', 'Online', 'Other');

-- CreateEnum
CREATE TYPE "AccountTypes" AS ENUM ('Checking', 'Savings', 'CreditCard', 'Loan', 'Investment', 'Mortgage', 'Other');

-- CreateEnum
CREATE TYPE "Language" AS ENUM ('English');

-- CreateEnum
CREATE TYPE "FinancialVendor" AS ENUM ('Plaid');

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
    "username" TEXT,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'User',
    "status" "UserStatus" NOT NULL DEFAULT 'Active_Demo',
    "country" "Country" NOT NULL DEFAULT 'USA',
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
CREATE TABLE "UserPreferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "currency" "IsoCurrencyCode" NOT NULL DEFAULT 'USD',
    "language" "Language" NOT NULL DEFAULT 'English',
    "theme" TEXT,
    "autoRefresh" BOOLEAN NOT NULL DEFAULT false,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserPreferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserOnboardingStage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "isBillingConnected" BOOLEAN NOT NULL DEFAULT false,
    "hasBankingAccountConnected" BOOLEAN NOT NULL DEFAULT false,
    "hasCreatedBudget" BOOLEAN NOT NULL DEFAULT false,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserOnboardingStage_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "AccountAccess" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "provider" "FinancialVendor" NOT NULL DEFAULT 'Plaid',
    "providerItemId" TEXT NOT NULL,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AccountAccess_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "accessAccountId" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "institutionDisplayName" TEXT NOT NULL,
    "institutionOfficialName" TEXT,
    "institutionId" TEXT,
    "latestTransactionSyncCursor" TEXT,
    "type" "AccountTypes" NOT NULL DEFAULT 'Other',
    "subType" TEXT,
    "mask" TEXT DEFAULT '0000',
    "bankInstitutionId" TEXT,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isoCurrencyCode" "IsoCurrencyCode" NOT NULL DEFAULT 'USD',
    "merchantName" TEXT,
    "name" TEXT,
    "pending" BOOLEAN NOT NULL DEFAULT false,
    "paymentChannel" "PaymentChannel" NOT NULL DEFAULT 'Other',
    "addressId" TEXT,
    "budgetCategoryId" TEXT,
    "categoryConfidenceLevel" TEXT,
    "categoryPrimary" TEXT,
    "categoryDetailed" TEXT,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccountBalance" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "available" DECIMAL(65,30) NOT NULL,
    "current" DECIMAL(65,30) NOT NULL,
    "limit" DECIMAL(65,30),
    "isoCurrency" "IsoCurrencyCode" NOT NULL DEFAULT 'USD',
    "lastUpdated" TIMESTAMP(3) NOT NULL,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AccountBalance_pkey" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "BudgetCategory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "emoji" TEXT NOT NULL DEFAULT '💸',
    "color" TEXT,
    "budgetFrequency" "BudgetFrequency" NOT NULL DEFAULT 'Monthly',
    "budgetType" "BudgetCategoryType" NOT NULL DEFAULT 'Debit',
    "amount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BudgetCategory_pkey" PRIMARY KEY ("id")
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

-- CreateTable
CREATE TABLE "Rule" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "conditions" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "model" "RuleModels" NOT NULL DEFAULT 'Transaction',
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Rule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SeedHash_id_key" ON "SeedHash"("id");

-- CreateIndex
CREATE INDEX "seed_hash_index" ON "SeedHash"("hash");

-- CreateIndex
CREATE UNIQUE INDEX "User_id_key" ON "User"("id");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UserAuth_id_key" ON "UserAuth"("id");

-- CreateIndex
CREATE UNIQUE INDEX "UserAuth_userId_key" ON "UserAuth"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserPreferences_id_key" ON "UserPreferences"("id");

-- CreateIndex
CREATE UNIQUE INDEX "UserPreferences_userId_key" ON "UserPreferences"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserOnboardingStage_id_key" ON "UserOnboardingStage"("id");

-- CreateIndex
CREATE UNIQUE INDEX "UserOnboardingStage_userId_key" ON "UserOnboardingStage"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserSession_id_key" ON "UserSession"("id");

-- CreateIndex
CREATE UNIQUE INDEX "UserSession_userId_key" ON "UserSession"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserSessionAccess_id_key" ON "UserSessionAccess"("id");

-- CreateIndex
CREATE INDEX "user_session_access_session_id_index" ON "UserSessionAccess"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "AccountAccess_id_key" ON "AccountAccess"("id");

-- CreateIndex
CREATE INDEX "account_access_user_id_index" ON "AccountAccess"("userId");

-- CreateIndex
CREATE INDEX "account_access_provider_item_id_index" ON "AccountAccess"("providerItemId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_id_key" ON "Account"("id");

-- CreateIndex
CREATE INDEX "account_access_account_id_index" ON "Account"("accessAccountId");

-- CreateIndex
CREATE INDEX "account_provider_account_id_index" ON "Account"("providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_id_key" ON "Transaction"("id");

-- CreateIndex
CREATE INDEX "transaction_user_id_index" ON "Transaction"("userId");

-- CreateIndex
CREATE INDEX "transaction_account_id_index" ON "Transaction"("accountId");

-- CreateIndex
CREATE INDEX "transaction_category_id_index" ON "Transaction"("budgetCategoryId");

-- CreateIndex
CREATE INDEX "transaction_date_index" ON "Transaction"("date");

-- CreateIndex
CREATE UNIQUE INDEX "AccountBalance_id_key" ON "AccountBalance"("id");

-- CreateIndex
CREATE INDEX "account_balance_account_id_index" ON "AccountBalance"("accountId");

-- CreateIndex
CREATE UNIQUE INDEX "BankInstitution_id_key" ON "BankInstitution"("id");

-- CreateIndex
CREATE UNIQUE INDEX "BudgetCategory_id_key" ON "BudgetCategory"("id");

-- CreateIndex
CREATE INDEX "budget_category_user_id_index" ON "BudgetCategory"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "TransactionCategory_id_key" ON "TransactionCategory"("id");

-- CreateIndex
CREATE UNIQUE INDEX "TransactionCategory_userId_key" ON "TransactionCategory"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Address_id_key" ON "Address"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Rule_id_key" ON "Rule"("id");

-- CreateIndex
CREATE INDEX "transaction_rule_user_id_index" ON "Rule"("userId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "Address"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAuth" ADD CONSTRAINT "UserAuth_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPreferences" ADD CONSTRAINT "UserPreferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserOnboardingStage" ADD CONSTRAINT "UserOnboardingStage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSession" ADD CONSTRAINT "UserSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSessionAccess" ADD CONSTRAINT "UserSessionAccess_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "UserSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountAccess" ADD CONSTRAINT "AccountAccess_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_accessAccountId_fkey" FOREIGN KEY ("accessAccountId") REFERENCES "AccountAccess"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_bankInstitutionId_fkey" FOREIGN KEY ("bankInstitutionId") REFERENCES "BankInstitution"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "Address"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_budgetCategoryId_fkey" FOREIGN KEY ("budgetCategoryId") REFERENCES "BudgetCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountBalance" ADD CONSTRAINT "AccountBalance_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BudgetCategory" ADD CONSTRAINT "BudgetCategory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransactionCategory" ADD CONSTRAINT "TransactionCategory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rule" ADD CONSTRAINT "Rule_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
