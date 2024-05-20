import { BaseRepository } from './base.repository';

class BankRepository extends BaseRepository {
  async getBankAccounts(userId: string) {
    var plaidAccounts = await this.client.plaidAccount.findMany({
      where: {
        AccessToken: {
          userId: userId,
        },
      },
      include: {
        AccessToken: true,
      },
    });

    return plaidAccounts;
  }
}

export const bankAccountRepository = new BankRepository();
