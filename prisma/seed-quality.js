// seed-quality.js
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const defaultQuality = await prisma.wigQuality.create({
    data: {
      name: "Standard",
      description: "Standard quality wig",
      orderIndex: 1
    }
  });
  
  console.log('Created default quality with ID:', defaultQuality.id);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });