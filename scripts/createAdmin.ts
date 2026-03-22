const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const adminPrisma = new PrismaClient();
const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const passwordPlain = process.env.ADMIN_PASSWORD;
const adminName = process.env.ADMIN_NAME?.trim() || "Admin";

function assertAdminEnv() {
  if (!email) {
    throw new Error("Missing ADMIN_EMAIL environment variable.");
  }

  if (!passwordPlain) {
    throw new Error("Missing ADMIN_PASSWORD environment variable.");
  }

  if (passwordPlain.length < 12) {
    throw new Error("ADMIN_PASSWORD must be at least 12 characters long.");
  }
}

async function main() {
  assertAdminEnv();
  const hashedPassword = await bcrypt.hash(passwordPlain, 12);

  const existing = await adminPrisma.user.findUnique({ where: { email } });
  if (existing) {
    await adminPrisma.user.update({
      where: { email },
      data: {
        hashedPassword,
        role: "admin",
        emailVerified: new Date(),
      },
    });
    console.log("Admin user already exists. Password and role updated.");
    return;
  }

  await adminPrisma.user.create({
    data: {
      email,
      name: adminName,
      hashedPassword,
      role: "admin",
      emailVerified: new Date(),
    },
  });

  console.log("Admin user created!");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
