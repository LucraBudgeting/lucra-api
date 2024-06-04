import { User } from '@prisma/client';
import { FastifyRequest, FastifyReply } from 'fastify';
import { CategoryService } from './category.service';
import { CategoryRequest } from '../types/category';

export async function CreateCategory(
  req: FastifyRequest<{ Body: CategoryRequest }>,
  reply: FastifyReply
) {
  const user = req.user as User;

  const categoryService = new CategoryService(user.id);

  const category = await categoryService.createCategory(req.body);

  return reply.send({ message: 'Category created', category });
}

export async function GetCategories(req: FastifyRequest, reply: FastifyReply) {
  const user = req.user as User;

  return reply.send({ message: 'Categories', user });
}
