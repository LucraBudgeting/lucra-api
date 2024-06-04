import { BaseRepository } from './base.repository';

class BankRepository extends BaseRepository {
  async getBankAccounts(userId: string) {
    const plaidAccounts = await this.client.plaidAccount.findMany({
      where: {
        accessToken: {
          userId: userId,
        },
      },
      include: {
        accessToken: false,
        bankInstitution: true,
      },
    });

    return plaidAccounts;
  }
}

export const bankAccountRepository = new BankRepository();
