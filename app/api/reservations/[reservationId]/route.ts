import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import { requireCurrentUser } from "@/app/lib/apiAuth";

export async function DELETE(
  request: Request,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context: any
) {
  const { currentUser, error } = await requireCurrentUser();
  if (error || !currentUser) {
    return error ?? NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const params = await (context?.params ?? {});
  const { reservationId } = params;
  if (!reservationId || Array.isArray(reservationId) || typeof reservationId !== 'string') {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  }
  try {
    const reservation = await prisma.reservation.findUnique({
      where: {
        id: reservationId,
      },
      include: {
        listing: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!reservation) {
      return NextResponse.json({ error: "Reservation not found" }, { status: 404 });
    }

    const canDelete =
      currentUser.role === "admin" ||
      reservation.userId === currentUser.id ||
      reservation.listing.userId === currentUser.id;

    if (!canDelete) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.reservation.delete({
      where: {
        id: reservationId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Failed to delete reservation:', error);
    return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 });
  }
}
