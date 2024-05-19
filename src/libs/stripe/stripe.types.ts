import { Address } from '@/interfaces/Address.type';

export class CreateStripeCustomer {
  constructor(payload: any, companyId: string) {
    this.email = payload.email;
    this.name = payload.name;
    this.companyId = companyId;
    this.address = {
      street1: payload.streetAddress1,
      street2: payload.streetAddress2,
      postalCode: payload.zip,
      city: payload.city,
      state: payload.state,
    };
    this.phone = payload.phoneNumber;
  }

  email: string;
  phone: string;
  name: string;
  companyId: string;
  address: Address;
}
