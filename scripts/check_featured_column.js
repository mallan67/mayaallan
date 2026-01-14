const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const res = await prisma.$queryRawUnsafe(`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_name='SiteSettings'
      AND table_schema='public'
      AND column_name='featuredBookId';
  `);

  if (Array.isArray(res) && res.length > 0) {
    console.log('COLUMN FOUND: featuredBookId exists on SiteSettings.');
    console.dir(res, { depth: null });
    process.exit(0);
  } else {
    console.log('NOT FOUND: featuredBookId does NOT exist on SiteSettings.');
    process.exit(0);
  }
}

main()
  .catch((err) => {
    console.error('Error checking column:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
