import { NextResponse } from "next/server";

import getCurrentUser from "@/app/actions/getCurrentUser";
import prisma from "@/app/libs/prismadb";

interface IParams {
    listingId?: string;
}

export async function DELETE(
    request: Request,
    { params }: { params: IParams }
) {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
        return NextResponse.error();
    }

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
  { params }: { params: { listingId: string } }
) {
  const { listingId } = params;
  if (!listingId) {
    return NextResponse.json({ error: "Listing ID required" }, { status: 400 });
  }
  try {
    await prisma.listing.delete({ where: { id: listingId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete property" }, { status: 500 });
  }
}
