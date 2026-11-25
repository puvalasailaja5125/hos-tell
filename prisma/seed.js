const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

async function main() {
  const rooms = [
    { number: "101", rentAmount: 6000 },
    { number: "102", rentAmount: 6000 },
    { number: "201", rentAmount: 7500 },
  ];
  for (const room of rooms) {
    await prisma.room.upsert({ where: { number: room.number }, update: {}, create: room });
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminEmail || !adminPassword) {
    throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD in your .env file.");
  }

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: "PG Owner",
      email: adminEmail,
      passwordHash: await bcrypt.hash(adminPassword, 10),
      role: "ADMIN",
    },
  });
  console.log("Seeded rooms and admin");
}

main().finally(() => prisma.$disconnect());