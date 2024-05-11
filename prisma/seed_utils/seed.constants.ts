import { Country, User, UserAuth, UserStatus } from '@prisma/client';
import { cryptHashSync } from '../../src/libs/bcrypt';
import { generateCUID } from './cuid';

const cryptPassword = 'Password98';
const hashPassword = cryptHashSync(cryptPassword);

export const userIdConstants = {
  user1Id: 'clvizu0cz000008mc3ff9hs97',
  user2Id: 'clvizudgi000108mc18b8fi9s',
  user3Id: 'clvizugpp000208mcd170dkkl',
};

const dateCreated = {
  dateCreated: new Date(),
  dateUpdated: new Date(),
};

export const user1: User = {
  ...dateCreated,
  id: userIdConstants.user1Id,
  username: 'aliceIsBomb',
  email: 'alice@email.com',
  phoneNumber: '123-456-7890',
  status: UserStatus.Active_Paid,
  country: Country.USA,
  firstName: 'Alice',
  lastName: 'Barker',

  addressId: null,
};

export const user2: User = {
  ...dateCreated,
  id: userIdConstants.user2Id,
  username: 'bobIsBomb',
  email: 'bob@email.com',
  phoneNumber: '098-765-4321',
  status: UserStatus.Active_Demo,
  country: Country.USA,
  firstName: 'Bob',
  lastName: 'Harris',
  addressId: null,
};

export const user3: User = {
  ...dateCreated,
  id: userIdConstants.user3Id,
  username: 'charlieIsBomb',
  email: 'charlie@email.com',
  phoneNumber: '456-789-0123',
  status: UserStatus.Suspended,
  country: Country.USA,
  firstName: 'Charlie',
  lastName: 'Smith',
  addressId: null,
};

export const user1Auth: UserAuth = {
  ...dateCreated,
  id: generateCUID(),
  userId: user1.id,
  passwordHash: hashPassword,
};

export const user2Auth: UserAuth = {
  ...dateCreated,
  id: generateCUID(),
  userId: user2.id,
  passwordHash: hashPassword,
};

export const user3Auth: UserAuth = {
  ...dateCreated,
  id: generateCUID(),
  userId: user3.id,
  passwordHash: hashPassword,
};
