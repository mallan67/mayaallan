// scripts/drop_featured_column.js
// Usage: node -r dotenv/config scripts/drop_featured_column.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Dropping featuredBookId constraint (if exists) and column (if exists)...');

  // Drop FK constraint if present, then drop column
  // Using $executeRawUnsafe since these are DDL statements.
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "SiteSettings" DROP CONSTRAINT IF EXISTS "fk_sitesettings_featuredbook";
  `);

  await prisma.$executeRawUnsafe(`
    ALTER TABLE "SiteSettings" DROP COLUMN IF EXISTS "featuredBookId";
  `);

  console.log('Done. Column removed (if it existed).');
}

main()
  .catch((err) => {
    console.error('Error dropping column:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
