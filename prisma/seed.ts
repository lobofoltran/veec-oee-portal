import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

async function main() {
  console.log("Seeding database...");

  // ROLES
  const roles = ["ADMIN", "MANAGER", "OPERATOR"];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role },
      update: {},
      create: { name: role },
    });
  }

  // ADMIN PASSWORD
  const passwordHash = await bcrypt.hash("admin123", 10);

  // ADMIN USER
  const admin = await prisma.user.upsert({
    where: { email: "admin@veec.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@veec.com",
      password: passwordHash,
    },
  });

  const adminRole = await prisma.role.findUnique({
    where: { name: "ADMIN" },
  });

  if (adminRole) {
    await prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId: admin.id,
          roleId: adminRole.id,
        },
      },
      update: {},
      create: {
        userId: admin.id,
        roleId: adminRole.id,
      },
    });
  }

  console.log("Seed finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
