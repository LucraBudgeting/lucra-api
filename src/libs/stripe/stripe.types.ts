import { User } from '@prisma/client';

export class CreateStripeCustomer {
  constructor(payload: User) {
    this.email = payload.email;
    this.name = payload.name;
    this.phone = payload.phoneNumber ?? '';
    this.userId = payload.id;
  }

  email: string;
  phone: string;
  name: string;
  userId: string;
}
