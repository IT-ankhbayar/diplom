import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";
import Container from "../components/Container";
import Heading from "../components/Heading";
import AdminTabs from "../components/admin/AdminTabs";

export default async function AdminDashboard() {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "admin") {
    return null;
  }

  // Fetch all users, all reservations (orders), and all properties (listings)
  const users = await prisma.user.findMany();
  const reservations = await prisma.reservation.findMany({
    include: { listing: true },
  });
  const listings = await prisma.listing.findMany();

  return (
    <Container>
      <Heading title="Admin Dashboard" />
      <AdminTabs users={users} reservations={reservations} listings={listings} />
    </Container>
  );
}
