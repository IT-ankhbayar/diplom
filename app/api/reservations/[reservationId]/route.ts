import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";

export async function DELETE(
  request: Request,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context: any
) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.error();
  }
  const { params } = context;
  const { reservationId } = params;
  if (!reservationId || Array.isArray(reservationId) || typeof reservationId !== 'string') {
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
    console.error('Failed to delete reservation:', error);
    return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 });
  }
}