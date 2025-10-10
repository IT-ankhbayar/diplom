import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";

interface IParams {
  reservationId?: string;
};

export async function DELETE(
  request: Request,
  { params }: { params: IParams }
) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.error();
  }
  const { reservationId } = params;
  if (!reservationId || typeof reservationId !== 'string') {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  }
  try {
    const reservation = await prisma.reservation.deleteMany({
      where: {
        id: reservationId,
      }
    });
    return NextResponse.json(reservation);
  } catch (error: unknown) {
    // eslint-disable-next-line no-console
    console.error('Failed to delete reservation:', error);
    return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 });
  }
}