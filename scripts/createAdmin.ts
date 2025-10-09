const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const adminPrisma = new PrismaClient();

async function main() {
  const email = "admin@example.com"; 
  const passwordPlain = "YourStrongPassword123!"; 
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
      name: "Admin",
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
