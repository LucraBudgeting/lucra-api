import { PrismaClient } from '@prisma/client';
import {
  user1,
  user1Auth,
  user2,
  user2Auth,
  user3,
  user3Auth,
  userIdConstants,
} from './seed_utils/seed.constants';
import userGuideSeed from './seed_utils/userGuide.seed';

const prisma = new PrismaClient();

const forceSeedUpdate = process.env.FORCE_SEED_UPDATE === 'true';

async function main() {
  await userGuideSeed();

  if (process.env.NODE_ENV == 'production') {
    return;
  }

  const currentMigration =
    (await prisma.$queryRaw`SELECT "migration_name" FROM "_prisma_migrations" ORDER BY "finished_at" DESC LIMIT 1`) as [
      {
        migration_name?: string;
      },
    ];

  const currentSeedHash =
    (await prisma.$queryRaw`SELECT "hash" FROM "SeedHash" ORDER BY "dateCreated" DESC LIMIT 1`) as [
      {
        hash?: string;
      },
    ];

  if (forceSeedUpdate) {
    await seed();
    return;
  }

  if (currentMigration[0]?.migration_name === currentSeedHash[0]?.hash) {
    console.log(
      'No Seed Update Needed',
      currentMigration[0]?.migration_name,
      currentSeedHash[0]?.hash
    );
    return;
  }

  await seed(currentMigration[0]?.migration_name);
}

const seed = async (currentMigration?: string) => {
  console.log('Seeding Data');

  const userIds = Object.values(userIdConstants);

  await prisma.user.deleteMany({
    where: {
      id: {
        in: userIds,
      },
    },
  });

  await prisma.user.createMany({
    data: [user1, user2, user3],
  });

  await prisma.userAuth.createMany({
    data: [user1Auth, user2Auth, user3Auth],
  });

  if (currentMigration) {
    await prisma.seedHash.create({
      data: {
        hash: currentMigration,
      },
    });
  }
};

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
