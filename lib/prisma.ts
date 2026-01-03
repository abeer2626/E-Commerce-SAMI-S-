import { PrismaClient } from '@prisma/client';

// Global Prisma instance for development
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Prisma Client singleton for serverless environments
 *
 * In development, caches the Prisma instance globally to avoid
 * exhausting database connections during hot reloading.
 * In production, creates a new instance per request.
 */
const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

// Cache in development only
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export { prisma };

// For use in API routes that need to manage connections manually
export { PrismaClient };
