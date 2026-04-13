import { describe, expect, it } from "vitest";

import { hasRequestConflicts, parseReservationInput } from "@/app/lib/reservationValidation";

describe("reservation validation", () => {
  it("rejects invalid reservation date ranges", () => {
    expect(
      parseReservationInput({
        listingId: "507f1f77bcf86cd799439011",
        startDate: "invalid",
        endDate: "2026-03-24T00:00:00.000Z",
        totalPrice: 100,
      })
    ).toEqual({
      error: "Invalid reservation date range.",
    });
  });

  it("detects overlapping reservation requests for the same listing", () => {
    expect(
      hasRequestConflicts([
        {
          listingId: "507f1f77bcf86cd799439011",
          startDate: new Date("2026-03-20T00:00:00.000Z"),
          endDate: new Date("2026-03-22T00:00:00.000Z"),
          totalPrice: 100,
        },
        {
          listingId: "507f1f77bcf86cd799439011",
          startDate: new Date("2026-03-22T00:00:00.000Z"),
          endDate: new Date("2026-03-24T00:00:00.000Z"),
          totalPrice: 120,
        },
      ])
    ).toEqual({
      error: "Request contains overlapping reservations for listing 507f1f77bcf86cd799439011.",
    });
  });

  it("allows non-overlapping requests", () => {
    expect(
      hasRequestConflicts([
        {
          listingId: "507f1f77bcf86cd799439011",
          startDate: new Date("2026-03-20T00:00:00.000Z"),
          endDate: new Date("2026-03-21T00:00:00.000Z"),
          totalPrice: 100,
        },
        {
          listingId: "507f1f77bcf86cd799439011",
          startDate: new Date("2026-03-23T00:00:00.000Z"),
          endDate: new Date("2026-03-24T00:00:00.000Z"),
          totalPrice: 120,
        },
      ])
    ).toEqual({
      error: null,
    });
  });
});
