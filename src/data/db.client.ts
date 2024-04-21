export * from "@prisma/client";
import { prisma } from "./prisma.client";

export const dbClient = prisma;
