import prisma from "@/app/libs/prismadb";

async function main() {
  await prisma.user.deleteMany({ where: { email: "admin@example.com" } });
  console.log("Deleted admin@example.com if it existed.");
}

main().catch(console.error);
