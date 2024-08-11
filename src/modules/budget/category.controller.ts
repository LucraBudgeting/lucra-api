import { User } from '@prisma/client';
import { FastifyRequest, FastifyReply } from 'fastify';
import { ICategoryRequest } from './types/category';
import { CategoryService } from './category.service';

export async function CreateCategory(
  req: FastifyRequest<{ Body: ICategoryRequest }>,
  reply: FastifyReply
) {
  const user = req.user as User;

  const categoryService = new CategoryService(user.id);

  const category = await categoryService.createCategory(req.body);

  return reply.send({ message: 'Category created', category });
}

export async function GetCategories(req: FastifyRequest, reply: FastifyReply) {
  const user = req.user as User;

  const categoryService = new CategoryService(user.id);
  const categories = await categoryService.getCategories();

  return reply.send({ message: 'Categories Fetched', categories });
}

export async function DeleteCategory(
  req: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  const user = req.user as User;

  const categoryService = new CategoryService(user.id);

  await categoryService.deleteCategory(req.params.id);
  const categories = await categoryService.getCategories();

  return reply.send({ message: 'Category deleted', categories });
}

export async function UpdateCategory(
  req: FastifyRequest<{ Body: ICategoryRequest }>,
  reply: FastifyReply
) {
  const user = req.user as User;

  const categoryService = new CategoryService(user.id);

  const categories = await categoryService.updateCategory(req.body);

  return reply.send({ message: 'Category updated', categories });
}
