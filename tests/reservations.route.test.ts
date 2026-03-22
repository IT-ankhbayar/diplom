import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextResponse } from "next/server";

const { prismaMock, requireCurrentUserMock, parseReservationInputMock, ensureListingAvailableMock } = vi.hoisted(
  () => ({
    prismaMock: {
      reservation: {
        create: vi.fn(),
      },
    },
    requireCurrentUserMock: vi.fn(),
    parseReservationInputMock: vi.fn(),
    ensureListingAvailableMock: vi.fn(),
  })
);

vi.mock("@/app/libs/prismadb", () => ({
  default: prismaMock,
}));

vi.mock("@/app/lib/apiAuth", () => ({
  requireCurrentUser: requireCurrentUserMock,
}));

vi.mock("@/app/lib/reservationValidation", () => ({
  parseReservationInput: parseReservationInputMock,
  ensureListingAvailable: ensureListingAvailableMock,
}));

import { POST } from "@/app/api/reservations/route";

describe("POST /api/reservations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when the user is not authenticated", async () => {
    requireCurrentUserMock.mockResolvedValue({
      currentUser: null,
      error: NextResponse.json({ error: "Not authenticated" }, { status: 401 }),
    });

    const response = await POST(
      new Request("http://localhost/api/reservations", {
        method: "POST",
        body: JSON.stringify({}),
      })
    );

    expect(response.status).toBe(401);
  });

  it("returns 400 when reservation input is invalid", async () => {
    requireCurrentUserMock.mockResolvedValue({
      currentUser: { id: "user-1" },
      error: null,
    });
    parseReservationInputMock.mockReturnValue({
      error: "Invalid reservation date range.",
    });

    const response = await POST(
      new Request("http://localhost/api/reservations", {
        method: "POST",
        body: JSON.stringify({
          listingId: "507f1f77bcf86cd799439011",
          startDate: "bad-date",
          endDate: "2026-03-24T00:00:00.000Z",
          totalPrice: 100,
        }),
      })
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Invalid reservation date range.",
    });
  });

  it("creates a reservation when validation and availability checks pass", async () => {
    requireCurrentUserMock.mockResolvedValue({
      currentUser: { id: "user-1" },
      error: null,
    });
    parseReservationInputMock.mockReturnValue({
      error: null,
      value: {
        listingId: "507f1f77bcf86cd799439011",
        startDate: new Date("2026-03-20T00:00:00.000Z"),
        endDate: new Date("2026-03-24T00:00:00.000Z"),
        totalPrice: 100,
      },
    });
    ensureListingAvailableMock.mockResolvedValue({ error: null });
    prismaMock.reservation.create.mockResolvedValue({
      id: "reservation-1",
      userId: "user-1",
    });

    const response = await POST(
      new Request("http://localhost/api/reservations", {
        method: "POST",
        body: JSON.stringify({
          listingId: "507f1f77bcf86cd799439011",
          startDate: "2026-03-20T00:00:00.000Z",
          endDate: "2026-03-24T00:00:00.000Z",
          totalPrice: 100,
        }),
      })
    );

    expect(response.status).toBe(200);
    expect(prismaMock.reservation.create).toHaveBeenCalledWith({
      data: {
        listingId: "507f1f77bcf86cd799439011",
        userId: "user-1",
        startDate: new Date("2026-03-20T00:00:00.000Z"),
        endDate: new Date("2026-03-24T00:00:00.000Z"),
        totalPrice: 100,
      },
    });
  });
});
