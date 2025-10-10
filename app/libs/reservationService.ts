import prisma from './prismadb';

export async function getReservations(authorId: string) {
  try {
    const reservationsRaw = await prisma.reservation.findMany({
      where: {
        userId: authorId,
      },
      include: {
        listing: true,
      },
    });

    const reservations = reservationsRaw.filter(r => r.listing !== null);

    return reservations;
  } catch (error) {
    console.error("Failed to get reservations:", error);
    throw error;
  }
}
