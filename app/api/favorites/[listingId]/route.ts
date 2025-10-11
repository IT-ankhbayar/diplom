import { NextResponse } from "next/server";
import getCurrentUser from "@/app/actions/getCurrentUser";
import prisma from "@/app/libs/prismadb";

export async function POST(
    request: Request,
    // Next's internal types can be strict; accept the context as any to be compatible with the runtime shape.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    context: any
) {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
        return NextResponse.error();
    }

    const { params } = context;
    const { listingId } = params;

    if (!listingId || Array.isArray(listingId) || typeof listingId !== 'string') {
        throw new Error('Invalid ID');
    }

    const favoriteIds = [ ...(currentUser.favoriteIds || [])];
    const updatedFavoriteIds = [...favoriteIds, listingId];

    const user = await prisma.user.update({
        where: {
            id: currentUser.id
        },
        data: {
                favoriteIds: updatedFavoriteIds
            }
    });
    return NextResponse.json(user);
}

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

    if (!listingId || Array.isArray(listingId) || typeof listingId !== 'string') {
        throw new Error('Invalid ID');
    }

    const favoriteIds = [ ... (currentUser.favoriteIds || [])];
    const updatedFavoriteIds = favoriteIds.filter((id) => id !== listingId);

    const user = await prisma.user.update({
        where: {
            id: currentUser.id
        },
        data: {
            favoriteIds: updatedFavoriteIds
        }
    });
    return NextResponse.json(user);
}