import { Institution } from 'plaid';
import { BankInstitution } from '@prisma/client';
import { BaseRepository } from './base.repository';

class BankInstitutionRepository extends BaseRepository {
  async createBankInstitutionFromPlaid(bankInstitution: Institution): Promise<BankInstitution> {
    return await this.client.bankInstitution.create({
      data: {
        institutionId: bankInstitution.institution_id,
        name: bankInstitution.name,
        website: bankInstitution.url,
        primaryColor: bankInstitution.primary_color,
        logo: bankInstitution.logo,
      },
    });
  }
}

export const bankInstitutionRepository = new BankInstitutionRepository();
