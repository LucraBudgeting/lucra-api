import {
  createPlaidLinkToken,
  exchangePlaidToken,
  getRecurringTransactions,
  getTransactions,
} from "@/modules/plaid/plaid.controller";
import { HttpMethods } from "@/utils/HttpMethods";
import { FastifyInstance, RouteOptions } from "fastify";

const basePath = "/plaid";

export default async function Plaid(
  fastify: FastifyInstance,
  opts: RouteOptions
) {
  fastify.route({
    method: HttpMethods.POST,
    url: `${basePath}/link_token`,
    handler: createPlaidLinkToken,
  });

  fastify.route({
    method: HttpMethods.GET,
    url: `${basePath}/exchange_token/:publicToken`,
    handler: exchangePlaidToken,
  });

  fastify.route({
    method: HttpMethods.GET,
    url: `${basePath}/transactions`,
    handler: getTransactions,
  });

  fastify.route({
    method: HttpMethods.GET,
    url: `${basePath}/recurring_transactions`,
    handler: getRecurringTransactions,
  });
}
