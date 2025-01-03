import { transactionRepository } from '@/data/repositories/transaction.repository';
import { TransactionRuleService } from './rules.transaction.service';

export class OverwriteRuleService {
  private userId: string;
  private rulesService: TransactionRuleService;

  constructor(userId: string) {
    this.userId = userId;
    this.rulesService = new TransactionRuleService(userId);
  }

  async ApplyAutoToRules(): Promise<void> {}

  async ApplyRulesToTransactions(): Promise<void> {
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
    let transactions = await transactionRepository.getUserTransactions(this.userId, twoYearsAgo);
    transactions = await this.rulesService.applyRulesToTransactions(transactions);
    transactions = transactions.filter((transaction) => transaction.budgetCategoryId);
    await transactionRepository.updateTransactionMany(transactions);
  }
}
