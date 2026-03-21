import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import { requireCurrentUser } from "@/app/lib/apiAuth";
import {
  type ReservationInput,
  ensureListingAvailable,
  hasRequestConflicts,
  parseReservationInput,
} from "@/app/lib/reservationValidation";

export async function POST(request: Request) {
  const { currentUser, error } = await requireCurrentUser();
  if (error || !currentUser) {
    return error ?? NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { items, paymentMethod } = body as {
      items: { id: string; startDate: string; endDate: string; totalPrice: number }[];
      paymentMethod?: string;
    };

    if (!items?.length) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    const parsedItems: ReservationInput[] = [];

    for (const it of items) {
      const parsed = parseReservationInput({
        listingId: it.id,
        startDate: it.startDate,
        endDate: it.endDate,
        totalPrice: it.totalPrice,
      });

      if (parsed.error !== null) {
        return NextResponse.json(
          { error: `${parsed.error} Listing: ${it.id}` },
          { status: 400 }
        );
      }

      const reservationInput = parsed.value;
      parsedItems.push(reservationInput);
    }

    const requestConflict = hasRequestConflicts(parsedItems);
    if (requestConflict.error) {
      return NextResponse.json({ error: requestConflict.error }, { status: 409 });
    }

    const availabilityChecks = await Promise.all(
      parsedItems.map(async (item) => ({
        listingId: item.listingId,
        ...(await ensureListingAvailable(item)),
      }))
    );

    const failedCheck = availabilityChecks.find((check) => check.error);
    if (failedCheck?.error) {
      const status = failedCheck.error === "Listing not found." ? 404 : 409;
      return NextResponse.json(
        { error: `${failedCheck.error} Listing: ${failedCheck.listingId}` },
        { status }
      );
    }

    const created = await prisma.$transaction(
      parsedItems.map((item) =>
        prisma.reservation.create({
          data: {
            userId: currentUser.id,
            listingId: item.listingId,
            startDate: item.startDate,
            endDate: item.endDate,
            totalPrice: item.totalPrice,
            paymentMethod: paymentMethod ?? null,
          },
        })
      )
    );

    return NextResponse.json({ ok: true, reservations: created });
  } catch (e: unknown) {
    console.error("Create reservation error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to create reservation" },
      { status: 500 }
    );
  }
}
