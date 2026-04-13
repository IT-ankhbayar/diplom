import { NextResponse } from "next/server";

import { requireAdminUser } from "@/app/lib/apiAuth";
import prisma from "@/app/libs/prismadb";

type RangeKey = "today" | "7d" | "30d" | "12m";
type DailyAggregateRow = {
  _id?: string;
  bookings?: number;
  newUsers?: number;
  visitorIds?: unknown[];
};
type CategoryAggregateRow = {
  name?: string;
  value?: number;
};

function getRangeStart(range: RangeKey): Date {
  const now = new Date();
  const start = new Date(now);

  switch (range) {
    case "today":
      start.setHours(0, 0, 0, 0);
      return start;
    case "7d":
      start.setDate(start.getDate() - 6);
      start.setHours(0, 0, 0, 0);
      return start;
    case "30d":
      start.setDate(start.getDate() - 29);
      start.setHours(0, 0, 0, 0);
      return start;
    case "12m":
      start.setMonth(start.getMonth() - 11);
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      return start;
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

function extractObjectId(value: unknown): string | null {
  if (typeof value === "string") {
    return value;
  }

  if (value && typeof value === "object" && "$oid" in value) {
    const oid = (value as { $oid?: unknown }).$oid;
    return typeof oid === "string" ? oid : null;
  }

  return null;
}

function buildDailyMap(rangeStart: Date) {
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
    dailyMap[formatDateKey(cursor)] = {
      visitorsSet: new Set<string>(),
      newUsers: 0,
      bookings: 0,
    };
    cursor.setDate(cursor.getDate() + 1);
  }

  return dailyMap;
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

  const [userCount, bookingCount, listingCount, userDailyRows, reservationDailyRows, bookingByCategoryRows] =
    await Promise.all([
      prisma.user.count({
        where: {
          createdAt: {
            gte: rangeStart,
          },
        },
      }),
      prisma.reservation.count({
        where: {
          createdAt: {
            gte: rangeStart,
          },
        },
      }),
      prisma.listing.count({
        where: {
          createdAt: {
            gte: rangeStart,
          },
        },
      }),
      prisma.user.aggregateRaw({
        pipeline: [
          {
            $match: {
              createdAt: {
                $gte: rangeStart,
              },
            },
          },
          {
            $group: {
              _id: {
                $dateToString: {
                  format: "%Y-%m-%d",
                  date: "$createdAt",
                },
              },
              newUsers: {
                $sum: 1,
              },
              visitorIds: {
                $addToSet: "$_id",
              },
            },
          },
          {
            $sort: {
              _id: 1,
            },
          },
        ],
      }) as unknown as Promise<DailyAggregateRow[]>,
      prisma.reservation.aggregateRaw({
        pipeline: [
          {
            $match: {
              createdAt: {
                $gte: rangeStart,
              },
            },
          },
          {
            $group: {
              _id: {
                $dateToString: {
                  format: "%Y-%m-%d",
                  date: "$createdAt",
                },
              },
              bookings: {
                $sum: 1,
              },
              visitorIds: {
                $addToSet: "$userId",
              },
            },
          },
          {
            $sort: {
              _id: 1,
            },
          },
        ],
      }) as unknown as Promise<DailyAggregateRow[]>,
      prisma.reservation.aggregateRaw({
        pipeline: [
          {
            $match: {
              createdAt: {
                $gte: rangeStart,
              },
            },
          },
          {
            $lookup: {
              from: "Listing",
              localField: "listingId",
              foreignField: "_id",
              as: "listing",
            },
          },
          {
            $unwind: {
              path: "$listing",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $group: {
              _id: {
                $ifNull: ["$listing.category", "Other"],
              },
              value: {
                $sum: 1,
              },
            },
          },
          {
            $project: {
              _id: 0,
              name: "$_id",
              value: 1,
            },
          },
          {
            $sort: {
              value: -1,
              name: 1,
            },
          },
        ],
      }) as unknown as Promise<CategoryAggregateRow[]>,
    ]);

  const dailyMap = buildDailyMap(rangeStart);

  for (const row of userDailyRows) {
    if (!row._id) {
      continue;
    }

    const day = dailyMap[row._id] ?? {
      visitorsSet: new Set<string>(),
      newUsers: 0,
      bookings: 0,
    };

    day.newUsers = row.newUsers ?? 0;

    for (const visitorId of row.visitorIds ?? []) {
      const parsedId = extractObjectId(visitorId);
      if (parsedId) {
        day.visitorsSet.add(parsedId);
      }
    }

    dailyMap[row._id] = day;
  }

  for (const row of reservationDailyRows) {
    if (!row._id) {
      continue;
    }

    const day = dailyMap[row._id] ?? {
      visitorsSet: new Set<string>(),
      newUsers: 0,
      bookings: 0,
    };

    day.bookings = row.bookings ?? 0;

    for (const visitorId of row.visitorIds ?? []) {
      const parsedId = extractObjectId(visitorId);
      if (parsedId) {
        day.visitorsSet.add(parsedId);
      }
    }

    dailyMap[row._id] = day;
  }

  const labels: string[] = [];
  const visitors: number[] = [];
  const newUsersSeries: number[] = [];
  const bookingsSeries: number[] = [];

  for (const key of Object.keys(dailyMap).sort()) {
    const day = dailyMap[key];
    labels.push(key);
    visitors.push(day.visitorsSet.size);
    newUsersSeries.push(day.newUsers);
    bookingsSeries.push(day.bookings);
  }

  const totalVisitors = Object.values(dailyMap).reduce((total, day) => total + day.visitorsSet.size, 0);

  return NextResponse.json({
    range,
    daily: {
      labels,
      visitors,
      newUsers: newUsersSeries,
      bookings: bookingsSeries,
    },
    totals: {
      visitors: totalVisitors,
      users: userCount,
      bookings: bookingCount,
      listings: listingCount,
    },
    bookingByCategory: bookingByCategoryRows
      .filter((row) => typeof row.name === "string" && typeof row.value === "number")
      .map((row) => ({
        name: row.name as string,
        value: row.value as number,
      })),
  });
}
