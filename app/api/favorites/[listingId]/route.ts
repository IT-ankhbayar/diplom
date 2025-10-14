import { NextResponse } from "next/server";
import getCurrentUser from "@/app/actions/getCurrentUser";
import prisma from "@/app/libs/prismadb";

export async function POST(
    request: Request,
    // Next's internal types can be strict; accept the context as any to be compatible with the runtime shape.
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

        if (!listingId || Array.isArray(listingId) || typeof listingId !== "string") {
            return NextResponse.json({ error: "Invalid listing id" }, { status: 400 });
        }

        const favoriteIds = [...(currentUser.favoriteIds || [])];
        const updatedFavoriteIds = [...favoriteIds, listingId];

        const user = await prisma.user.update({
            where: {
                id: currentUser.id,
            },
            data: {
                favoriteIds: updatedFavoriteIds,
            },
        });

        return NextResponse.json(user);
    } catch (error) {
        console.error("POST /api/favorites/[listingId] error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

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

        if (!listingId || Array.isArray(listingId) || typeof listingId !== "string") {
            return NextResponse.json({ error: "Invalid listing id" }, { status: 400 });
        }

        const favoriteIds = [...(currentUser.favoriteIds || [])];
        const updatedFavoriteIds = favoriteIds.filter((id) => id !== listingId);

        const user = await prisma.user.update({
            where: {
                id: currentUser.id,
            },
            data: {
                favoriteIds: updatedFavoriteIds,
            },
        });

        return NextResponse.json(user);
    } catch (error) {
        console.error("DELETE /api/favorites/[listingId] error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}