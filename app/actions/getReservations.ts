import prisma from '@/app/libs/prismadb';
import { Prisma } from '@prisma/client';

interface IParams {
    listingId?: string;
    userId?: string;
    authorId?: string;
}

export default async function getReservations(
    params: IParams
) {
    try {

        const { listingId, userId, authorId } = params;

    const query: Prisma.ReservationWhereInput = {};

        if (listingId) {
            query.listingId = listingId;
        }

        if (userId) {
            query.userId = userId;
        }

        if (authorId) {
            query.listing = { userId: authorId }
        }

        const reservations = await prisma.reservation.findMany({
            where: query,
            include: {
                listing: true,
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        const safeReservations = reservations.map(
            (reservation) => ({
                ...reservation,
                createdAt: reservation.createdAt.toISOString(),
                startDate: reservation.startDate.toISOString(),
                endDate: reservation.endDate.toISOString(),
                listing: {
                    ...reservation.listing,
                    createdAt: reservation.listing.createdAt.toISOString()
                }
            })
        );

        return safeReservations;
    } catch (error: unknown) {
        console.error('getReservations error:', error);
        if (error instanceof Error) {
            throw new Error(error.message);
        }
        throw new Error(String(error ?? 'Unknown error in getReservations'));
    }
}