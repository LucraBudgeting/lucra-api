import { TransactionService } from '@/modules/transaction/transaction.service';
import { transactionRepository } from '@/data/repositories/transaction.repository';
import { TransactionRuleService } from './rules.transaction.service';

export class OverwriteRuleService {
  private userId: string;
  private rulesService: TransactionRuleService;
  private transactionService: TransactionService;

  constructor(userId: string) {
    this.userId = userId;
    this.rulesService = new TransactionRuleService(userId);
    this.transactionService = new TransactionService(userId);
  }

  async ApplyAutoToRules(): Promise<void> {}

  async ApplyRulesToTransactions(): Promise<void> {
    let transactions = await this.transactionService.getTransactions();
    transactions = await this.rulesService.applyRulesToTransactions(transactions);

    await transactionRepository.updateTransactionMany(transactions);
  }
}
