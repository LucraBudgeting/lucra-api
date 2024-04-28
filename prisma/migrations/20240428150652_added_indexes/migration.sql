-- CreateIndex
CREATE INDEX "plaid_account_account_id_index" ON "PlaidAccount"("accountId");

-- CreateIndex
CREATE INDEX "plaid_account_balance_account_id_index" ON "PlaidAccountBalance"("accountId");

-- CreateIndex
CREATE INDEX "plaid_transaction_account_id_index" ON "PlaidTransaction"("accountId");

-- CreateIndex
CREATE INDEX "plaid_transaction_category_plaid_transaction_id_index" ON "PlaidTransactionTransactionCategory"("plaidTransactionId");

-- CreateIndex
CREATE INDEX "plaid_transaction_category_transaction_category_id_index" ON "PlaidTransactionTransactionCategory"("transactionCategoryId");

-- CreateIndex
CREATE INDEX "seed_hash_index" ON "SeedHash"("hash");

-- CreateIndex
CREATE INDEX "transaction_category_user_id_index" ON "TransactionCategory"("userId");

-- CreateIndex
CREATE INDEX "user_email_index" ON "User"("email");

-- CreateIndex
CREATE INDEX "user_username_index" ON "User"("username");

-- CreateIndex
CREATE INDEX "user_auth_user_id_index" ON "UserAuth"("userId");

-- CreateIndex
CREATE INDEX "user_session_user_id_index" ON "UserSession"("userId");

-- CreateIndex
CREATE INDEX "user_session_access_session_id_index" ON "UserSessionAccess"("sessionId");

-- RenameIndex
ALTER INDEX "access_token_index" RENAME TO "plaid_account_access_token_index";
