import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";

const isObjectId = (v: unknown) =>
  typeof v === "string" && /^[a-f\d]{24}$/i.test(v);

export async function POST(request: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

    // ✅ Validate ObjectId + dates
    for (const it of items) {
      if (!isObjectId(it.id)) {
        return NextResponse.json(
          { error: `Invalid listingId (not ObjectId): ${it.id}` },
          { status: 400 }
        );
      }
      const sd = new Date(it.startDate);
      const ed = new Date(it.endDate);
      if (isNaN(sd.getTime()) || isNaN(ed.getTime())) {
        return NextResponse.json(
          { error: `Invalid date range: ${it.startDate} - ${it.endDate}` },
          { status: 400 }
        );
      }
    }

    const created = await prisma.$transaction(
      items.map((it) =>
        prisma.reservation.create({
          data: {
            userId: currentUser.id,
            listingId: it.id,
            startDate: new Date(it.startDate),
            endDate: new Date(it.endDate),
            totalPrice: it.totalPrice,
            paymentMethod: paymentMethod ?? null, // ✅ Prisma дээр нэмсэн field
          },
        })
      )
    );

    return NextResponse.json({ ok: true, reservations: created });
  } catch (e: any) {
    console.error("Create reservation error:", e);
    return NextResponse.json(
      { error: e?.message || "Failed to create reservation" },
      { status: 500 }
    );
  }
}
