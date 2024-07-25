import dotenv from 'dotenv';
dotenv.config();

export const {
  PORT,
  API_VERSION,
  CREDENTIALS,
  SECRET_KEY,
  FRONTEND_ORIGIN,
  DATABASE_URL,
  STRIPE_API_KEY,
  STRIPE_SUBSCRIPTION_WEBHOOK_SECRET,
  STRIPE_PRICE_ID,
  API_URL,
  PLAID_CLIENT_ID,
  PLAID_SECRET,
  NODE_ENV,
  NEW_RELIC_LICENSE_KEY,
} = process.env;

export const IS_PRODUCTION = NODE_ENV === 'production' || NODE_ENV === 'development';
