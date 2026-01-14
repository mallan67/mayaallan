require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

(async () => {
  const p = new PrismaClient();
  try {
    console.log('Using DB URL:', !!process.env.POSTGRES_PRISMA_URL ? 'SET' : 'MISSING');
    const res = await p.$queryRawUnsafe('SELECT 1 as ok;');
    console.log('PRISMA TEST OK:', res);
  } catch (err) {
    console.error('PRISMA_TEST_ERROR:');
    console.error(err && err.stack ? err.stack : err);
    process.exitCode = 1;
  } finally {
    await p.$disconnect();
  }
})();
