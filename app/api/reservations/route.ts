import { NextResponse } from 'next/server';

import prisma from "@/app/libs/prismadb";
import { requireCurrentUser } from "@/app/lib/apiAuth";
import { ensureListingAvailable, parseReservationInput } from "@/app/lib/reservationValidation";

export async function POST(
    request: Request
) {
    const { currentUser, error } = await requireCurrentUser();

    if (error || !currentUser) {
        return error ?? NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const parsed = parseReservationInput({
            listingId: body?.listingId,
            startDate: body?.startDate,
            endDate: body?.endDate,
            totalPrice: body?.totalPrice,
        });

        if (parsed.error) {
            return NextResponse.json({ error: parsed.error }, { status: 400 });
        }

        const availability = await ensureListingAvailable(parsed.value);

        if (availability.error) {
            const status = availability.error === "Listing not found." ? 404 : 409;
            return NextResponse.json({ error: availability.error }, { status });
        }

        const reservation = await prisma.reservation.create({
            data: {
                    listingId: parsed.value.listingId,
                    userId: currentUser.id,
                    startDate: parsed.value.startDate,
                    endDate: parsed.value.endDate,
                    totalPrice: parsed.value.totalPrice,
            },
        });

        return NextResponse.json(reservation);
    } catch (routeError: unknown) {
        console.error("Create reservation error:", routeError);
        return NextResponse.json({ error: "Failed to create reservation" }, { status: 500 });
    }
}
