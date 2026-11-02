/**
 * @numu/database
 *
 * Central export for the Prisma client singleton.
 * Import { db } from '@numu/database' in any app or package.
 */

import { PrismaClient } from '@prisma/client';

const createPrismaClient = (): PrismaClient => {
  return new PrismaClient({
    log: process.env['NODE_ENV'] === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
};

// In development we attach the client to the global object to prevent
// exhausting the database connection pool during hot-module reloads (Next.js).
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db: PrismaClient = globalForPrisma.prisma ?? createPrismaClient();

if (process.env['NODE_ENV'] !== 'production') {
  globalForPrisma.prisma = db;
}

export { PrismaClient };
export * from '@prisma/client';
