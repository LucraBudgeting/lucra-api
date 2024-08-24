import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const ids = {
  AddingAnAccount: 'cm08bbw0p000008jv9otx65ao',
  AddingABudget: 'cm08bcej3000108jv1lbv9efi',
  EditingABudget: 'cm08bcxgt000208jv6i3k23m8',
};

async function main() {
  const guides = [
    {
      id: ids.AddingAnAccount,
      title: 'Adding An Account',
      key: 'AddingAnAccount',
    },
    {
      id: ids.AddingABudget,
      title: 'Adding A Budget',
      key: 'AddingABudget',
    },
    {
      id: ids.EditingABudget,
      title: 'Editing A Budget',
      key: 'EditingABudget',
    },
  ];

  for (const guide of guides) {
    await prisma.guide.upsert({
      where: { id: guide.id },
      update: {
        title: guide.title,
        key: guide.key,
      },
      create: guide,
    });
  }

  console.log('Guides have been successfully upserted!');
}

export default main;
