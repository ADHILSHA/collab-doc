import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const SEED_USERS = [
  { name: "Alice", colorHex: "#F97316" },
  { name: "Bob", colorHex: "#3B82F6" },
  { name: "Carol", colorHex: "#10B981" },
];

async function main() {
  for (const user of SEED_USERS) {
    await prisma.user.upsert({
      where: { id: user.name.toLowerCase() },
      update: {},
      create: { id: user.name.toLowerCase(), ...user },
    });
  }
  console.log(`Seeded ${SEED_USERS.length} users.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
