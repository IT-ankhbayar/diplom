import { NextResponse } from "next/server";

import prisma from "@/app/libs/prismadb";
import { requireAdminUser } from "@/app/lib/apiAuth";

type RangeKey = "today" | "7d" | "30d" | "12m";
type ReservationWithListing = Awaited<ReturnType<typeof prisma.reservation.findMany>>[number];

function getRangeStart(range: RangeKey): Date {
  const now = new Date();
  const start = new Date(now);

  switch (range) {
    case "today": {
      start.setHours(0, 0, 0, 0);
      return start;
    }
    case "7d":
      start.setDate(start.getDate() - 6);
      start.setHours(0, 0, 0, 0);
      return start;
    case "30d":
      start.setDate(start.getDate() - 29);
      start.setHours(0, 0, 0, 0);
      return start;
    case "12m": {
      start.setMonth(start.getMonth() - 11);
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      return start;
    }
    default:
      start.setDate(start.getDate() - 6);
      start.setHours(0, 0, 0, 0);
      return start;
  }
}

function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export async function GET(request: Request) {
  const { error } = await requireAdminUser();

  if (error) {
    return error;
  }

  const { searchParams } = new URL(request.url);
  const rangeParam = (searchParams.get("range") as RangeKey | null) ?? "7d";
  const range: RangeKey =
    rangeParam === "today" ||
    rangeParam === "7d" ||
    rangeParam === "30d" ||
    rangeParam === "12m"
      ? rangeParam
      : "7d";

  const rangeStart = getRangeStart(range);

  const [users, reservations, listings] = await Promise.all([
    prisma.user.findMany({
      where: {
        createdAt: {
          gte: rangeStart,
        },
      },
    }),
    prisma.reservation.findMany({
      where: {
        createdAt: {
          gte: rangeStart,
        },
      },
      include: {
        listing: true,
      },
    }),
    prisma.listing.findMany({
      where: {
        createdAt: {
          gte: rangeStart,
        },
      },
    }),
  ]);

  const dailyMap: Record<
    string,
    {
      visitorsSet: Set<string>;
      newUsers: number;
      bookings: number;
    }
  > = {};

  const cursor = new Date(rangeStart);
  const now = new Date();

  while (cursor <= now) {
    const key = formatDateKey(cursor);
    dailyMap[key] = {
      visitorsSet: new Set<string>(),
      newUsers: 0,
      bookings: 0,
    };
    cursor.setDate(cursor.getDate() + 1);
  }

  users.forEach((user) => {
    const key = formatDateKey(new Date(user.createdAt));
    if (!dailyMap[key]) {
      dailyMap[key] = {
        visitorsSet: new Set<string>(),
        newUsers: 0,
        bookings: 0,
      };
    }
    dailyMap[key].newUsers += 1;
    if (user.id) {
      dailyMap[key].visitorsSet.add(user.id);
    }
  });

  reservations.forEach((reservation) => {
    const createdAt = (reservation as ReservationWithListing).createdAt;
    const created = createdAt ? new Date(createdAt) : new Date();
    const key = formatDateKey(created);

    if (!dailyMap[key]) {
      dailyMap[key] = {
        visitorsSet: new Set<string>(),
        newUsers: 0,
        bookings: 0,
      };
    }

    dailyMap[key].bookings += 1;
    if (reservation.userId) {
      dailyMap[key].visitorsSet.add(reservation.userId);
    }
  });

  const labels: string[] = [];
  const visitors: number[] = [];
  const newUsersSeries: number[] = [];
  const bookingsSeries: number[] = [];

  Object.keys(dailyMap)
    .sort()
    .forEach((key) => {
      const day = dailyMap[key];
      labels.push(key);
      visitors.push(day.visitorsSet.size);
      newUsersSeries.push(day.newUsers);
      bookingsSeries.push(day.bookings);
    });

  const bookingByCategoryMap: Record<string, number> = {};

  reservations.forEach((reservation) => {
    const category = reservation.listing?.category ?? "Other";
    bookingByCategoryMap[category] = (bookingByCategoryMap[category] ?? 0) + 1;
  });

  const bookingByCategory = Object.entries(bookingByCategoryMap).map(
    ([name, value]) => ({
      name,
      value,
    })
  );

  const totalVisitors = Object.values(dailyMap).reduce(
    (acc, day) => acc + day.visitorsSet.size,
    0
  );

  const responseBody = {
    range,
    daily: {
      labels,
      visitors,
      newUsers: newUsersSeries,
      bookings: bookingsSeries,
    },
    totals: {
      visitors: totalVisitors,
      users: users.length,
      bookings: reservations.length,
      listings: listings.length,
    },
    bookingByCategory,
  };

  return NextResponse.json(responseBody);
}

