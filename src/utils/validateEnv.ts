import { Type } from '@sinclair/typebox';

export const schema = Type.Object({
  API_VERSION: Type.String(),
  SECRET_KEY: Type.String(),
  PORT: Type.String(),
});
