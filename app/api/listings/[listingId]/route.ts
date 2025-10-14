import { NextResponse } from "next/server";

import getCurrentUser from "@/app/actions/getCurrentUser";
import prisma from "@/app/libs/prismadb";

export async function DELETE(
  request: Request,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context: any
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { params } = context ?? {};
    const listingId = params?.listingId ?? params?.id;

    if (!listingId || typeof listingId !== "string") {
      return NextResponse.json({ error: "Invalid or missing listing id" }, { status: 400 });
    }

    const deleted = await prisma.listing.deleteMany({
      where: {
        id: listingId,
        userId: currentUser.id,
      },
    });

    return NextResponse.json(deleted);
  } catch (error) {
    console.error("DELETE /api/listings/[listingId] error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(
  request: Request,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context: any
) {
  try {
    const { params } = context ?? {};
    const listingId = params?.listingId ?? params?.id;

    if (!listingId || typeof listingId !== "string") {
      return NextResponse.json({ error: "Listing ID required" }, { status: 400 });
    }

    await prisma.listing.delete({ where: { id: listingId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST /api/listings/[listingId] error:", error);
    return NextResponse.json({ error: "Failed to delete property" }, { status: 500 });
  }
}
