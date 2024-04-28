import { plaidRepository } from "@/libs/plaid/plaid.repository";
import { FastifyReply, FastifyRequest } from "fastify";

export async function createPlaidLinkToken(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const linkToken = await plaidRepository.createLinkToken();
  return { linkToken };
}

export async function exchangePlaidToken(
  request: FastifyRequest<{ Params: { publicToken: string } }>,
  reply: FastifyReply
) {
  const publicToken = request.params.publicToken;
  const accessToken = await plaidRepository.exchangePublicToken(publicToken);
  return { accessToken };
}

export async function getTransactions(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const transactions = await plaidRepository.getTransactions();
  return { transactions };
}

export async function getRecurringTransactions(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const recurringTransactions =
    await plaidRepository.getRecurringTransactions();
  return { recurringTransactions };
}
