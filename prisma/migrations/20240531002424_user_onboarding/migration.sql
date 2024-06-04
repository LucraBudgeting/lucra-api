-- CreateTable
CREATE TABLE "UserOnboardingStage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "hasPaymentConnected" BOOLEAN NOT NULL DEFAULT false,
    "hasBankingAccountConnected" BOOLEAN NOT NULL DEFAULT false,
    "hasCreatedBudget" BOOLEAN NOT NULL DEFAULT false,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserOnboardingStage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserOnboardingStage_id_key" ON "UserOnboardingStage"("id");

-- CreateIndex
CREATE INDEX "user_onboarding_step_user_id_index" ON "UserOnboardingStage"("userId");

-- AddForeignKey
ALTER TABLE "UserOnboardingStage" ADD CONSTRAINT "UserOnboardingStage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
