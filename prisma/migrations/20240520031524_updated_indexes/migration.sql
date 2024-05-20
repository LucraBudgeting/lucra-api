-- CreateIndex
CREATE INDEX "plaid_account_access_account_id_index" ON "PlaidAccount"("accessAccountId");

-- CreateIndex
CREATE INDEX "plaid_account_access_user_id_index" ON "PlaidAccountAccess"("userId");
