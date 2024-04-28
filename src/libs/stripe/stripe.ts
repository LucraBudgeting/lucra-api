import Strip from 'stripe';
import { STRIPE_API_KEY } from '@/config';

if (!STRIPE_API_KEY) {
  throw new Error('Missing Stripe API Key');
}

export const stripe = new Strip(STRIPE_API_KEY);
