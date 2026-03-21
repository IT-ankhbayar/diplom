import prisma from "@/app/libs/prismadb";

const OBJECT_ID_REGEX = /^[a-f\d]{24}$/i;

export type ReservationInput = {
  listingId: string;
  startDate: Date;
  endDate: Date;
  totalPrice: number;
};

export function parseReservationInput(raw: {
  listingId?: unknown;
  startDate?: unknown;
  endDate?: unknown;
  totalPrice?: unknown;
}) {
  const listingId = typeof raw.listingId === "string" ? raw.listingId : "";
  const startDate = new Date(raw.startDate as string);
  const endDate = new Date(raw.endDate as string);
  const totalPrice =
    typeof raw.totalPrice === "number"
      ? raw.totalPrice
      : typeof raw.totalPrice === "string"
        ? Number(raw.totalPrice)
        : NaN;

  if (!OBJECT_ID_REGEX.test(listingId)) {
    return { error: "Invalid listing ID." };
  }

  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return { error: "Invalid reservation date range." };
  }

  if (startDate > endDate) {
    return { error: "Start date must be on or before end date." };
  }

  if (!Number.isFinite(totalPrice) || totalPrice <= 0) {
    return { error: "Total price must be a positive number." };
  }

  return {
    error: null,
    value: {
      listingId,
      startDate,
      endDate,
      totalPrice,
    } satisfies ReservationInput,
  };
}

export async function ensureListingAvailable(input: ReservationInput) {
  const listing = await prisma.listing.findUnique({
    where: { id: input.listingId },
    select: { id: true },
  });

  if (!listing) {
    return { error: "Listing not found." };
  }

  const existingConflict = await prisma.reservation.findFirst({
    where: {
      listingId: input.listingId,
      startDate: { lte: input.endDate },
      endDate: { gte: input.startDate },
    },
    select: { id: true },
  });

  if (existingConflict) {
    return { error: "Listing is already reserved for the selected dates." };
  }

  return { error: null };
}

export function hasRequestConflicts(items: ReservationInput[]) {
  const grouped = new Map<string, ReservationInput[]>();

  items.forEach((item) => {
    const current = grouped.get(item.listingId) ?? [];
    current.push(item);
    grouped.set(item.listingId, current);
  });

  for (const [listingId, reservations] of grouped.entries()) {
    reservations.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

    for (let i = 1; i < reservations.length; i += 1) {
      if (reservations[i].startDate <= reservations[i - 1].endDate) {
        return {
          error: `Request contains overlapping reservations for listing ${listingId}.`,
        };
      }
    }
  }

  return { error: null };
}
