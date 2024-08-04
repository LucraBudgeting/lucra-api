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

  async getInstitutionById(institutionId?: string | null): Promise<BankInstitution | null> {
    if (!institutionId) return null;

    return await this.client.bankInstitution.findFirst({
      where: {
        institutionId,
      },
    });
  }
}

export const bankInstitutionRepository = new BankInstitutionRepository();
