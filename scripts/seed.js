const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  await prisma.book.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      title: "Test Book",
      slug: "test-book",
      subtitle1: "A test book",
      tagsCsv: "test",
      isPublished: true,
      isVisible: true,
      isFeatured: true,
      ebookFileUrl: "https://example.com/test.pdf",
      // set any other required fields per your schema, e.g., price, createdAt if required
    }
  });
  console.log("Seeded book id=1");
}
main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => process.exit());
