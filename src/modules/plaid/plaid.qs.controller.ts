import { qsPlaidRepository } from "@/libs/plaid/plaid.qs.repository";
import { FastifyReply, FastifyRequest } from "fastify";

export async function qsCreatePlaidLinkToken(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const linkToken = await qsPlaidRepository.createLinkToken();
  return { linkToken };
}

export async function qsExchangePlaidToken(
  request: FastifyRequest<{ Params: { publicToken: string } }>,
  reply: FastifyReply
) {
  const publicToken = request.params.publicToken;
  const accessToken = await qsPlaidRepository.exchangePublicToken(publicToken);
  return { accessToken };
}

export async function qsGetTransactions(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const transactions = await qsPlaidRepository.getTransactions();
  return { transactions };
}

export async function qsGetRecurringTransactions(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const recurringTransactions =
    await qsPlaidRepository.getRecurringTransactions();
  return { recurringTransactions };
}
