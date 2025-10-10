import prisma from '@/app/libs/prismadb';

import getCurrentUser from "./getCurrentUser";

export default async function getFavoriteListings() {
    try {
        const currentUser = await getCurrentUser();

        if (!currentUser) {
            return [];
        }

        const favorites = await prisma.listing.findMany({
            where: {
                id: {
                    in: [... (currentUser.favoriteIds || [])]
                }
            }
        });

        const safeFavorites = favorites.map((favorite) => ({
            ... favorite,
            createdAt: favorite.createdAt.toISOString()
        }));
        
        return safeFavorites;
    } catch (error: unknown) {
        // Log for debugging and wrap the unknown into an Error with a safe message
        // eslint-disable-next-line no-console
        console.error('getFavoriteListings error:', error);
        throw new Error(String(error ?? 'Unknown error in getFavoriteListings'));
    }
}