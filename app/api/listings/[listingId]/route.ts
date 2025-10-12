import { NextResponse } from "next/server";

import getCurrentUser from "@/app/actions/getCurrentUser";
import prisma from "@/app/libs/prismadb";

export async function DELETE(
  request: Request,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context: any
) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.error();
  }

  const { params } = context;
  const { listingId } = params;

  if (!listingId || typeof listingId !== 'string') {
    throw new Error('Invalid ID')
  }

  const listing = await prisma.listing.deleteMany({
    where: {
      id: listingId,
      userId: currentUser.id
    }
  });
    
  return NextResponse.json(listing);
}

export async function POST(
  request: Request,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context: any
) {
  const { params } = context;
  const { listingId } = params;
  if (!listingId || typeof listingId !== 'string') {
    return NextResponse.json({ error: "Listing ID required" }, { status: 400 });
  }
  try {
    await prisma.listing.delete({ where: { id: listingId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    // Log error for debugging
    console.error('Failed to delete listing:', error);
    return NextResponse.json({ error: "Failed to delete property" }, { status: 500 });
  }
}
