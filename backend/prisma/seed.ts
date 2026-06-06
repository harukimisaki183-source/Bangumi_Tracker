import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const presetTags = ['热血', '战斗', '日常', '后宫', '推理'];

  for (const name of presetTags) {
    await prisma.tag.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  console.log('Seeded preset tags:', presetTags.join(', '));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
