import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

export async function connectDb() {
  let retries = 5;
  while (retries > 0) {
    try {
      await prisma.$connect();
      console.log('Successfully connected to PostgreSQL');
      return;
    } catch (err) {
      console.error(`Failed to connect to PostgreSQL. Retries left: ${retries - 1}`);
      retries -= 1;
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
  throw new Error('Could not connect to PostgreSQL after multiple attempts');
}

export async function disconnectDb() {
  await prisma.$disconnect();
}
