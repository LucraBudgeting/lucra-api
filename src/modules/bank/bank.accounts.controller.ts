import { User } from '@prisma/client';
import { FastifyRequest, FastifyReply } from 'fastify';
import { BankAccountService } from './services/bank.accounts.service';
import { getCategoryListDictionary } from './data/transactionCategoryList.repository';

export async function GetBankAccounts(req: FastifyRequest, reply: FastifyReply) {
  // Get the user from the request object
  const user = req.user as User;

  // Create a new BankAccountService instance with the user ID
  const bankService = new BankAccountService(user.id);

  // Retrieve the bank accounts associated with the user using the bank service
  const bankAccounts = await bankService.getBankAccounts();

  // Send the bank accounts as a response
  return reply.send({
    message: 'Bank accounts', // The message to send with the response
    bankAccounts, // The bank accounts to send in the response
  });
}

export async function GetCategoryList(_req: FastifyRequest, reply: FastifyReply) {
  const categoryList = await getCategoryListDictionary();

  return reply.send({
    message: 'Category list',
    categoryList,
  });
}
