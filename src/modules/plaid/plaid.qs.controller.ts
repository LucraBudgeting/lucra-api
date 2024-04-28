import { FastifyReply, FastifyRequest } from 'fastify';
import { qsPlaidRepository } from '@/libs/plaid/plaid.qs.repository';

export async function qsCreatePlaidLinkToken(_request: FastifyRequest, _reply: FastifyReply) {
  const linkToken = await qsPlaidRepository.createLinkToken();
  return { linkToken };
}

export async function qsExchangePlaidToken(
  request: FastifyRequest<{ Params: { publicToken: string } }>,
  _reply: FastifyReply
) {
  const publicToken = request.params.publicToken;
  const accessToken = await qsPlaidRepository.exchangePublicToken(publicToken);
  return { accessToken };
}

export async function qsGetTransactions(_request: FastifyRequest, _reply: FastifyReply) {
  const transactions = await qsPlaidRepository.getTransactions();
  return { transactions };
}

export async function qsGetRecurringTransactions(_request: FastifyRequest, _reply: FastifyReply) {
  const recurringTransactions = await qsPlaidRepository.getRecurringTransactions();
  return { recurringTransactions };
}
