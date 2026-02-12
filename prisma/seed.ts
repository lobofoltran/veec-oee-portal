import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

async function main() {
  console.log("Seeding database...");

  const roles = ["ADMIN", "MANAGER", "OPERATOR"];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role },
      update: {},
      create: { name: role },
    });
  }

  const adminEmail = "admin@veec.com";
  const adminPassword = "admin123";
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: "Admin",
      active: true,
      password: passwordHash,
    },
    create: {
      name: "Admin",
      email: adminEmail,
      password: passwordHash,
      active: true,
    },
  });

  const adminRole = await prisma.role.findUniqueOrThrow({ where: { name: "ADMIN" } });

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

  if (process.env.NODE_ENV !== "production") {
    console.log(`[DEV] Admin credentials: ${adminEmail} / ${adminPassword}`);
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
