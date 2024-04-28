import { PrismaClient } from "@prisma/client";
import { dbClient } from "../db.client";

export class BaseRepository {
  protected client: PrismaClient;
  constructor() {
    this.client = dbClient;
  }
}
