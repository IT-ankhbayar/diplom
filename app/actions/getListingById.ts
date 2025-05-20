import prisma from "@/app/libs/prismadb";

interface IParams {
  listingId?: string;
}

export default async function getListingById(params: IParams) {
  const { listingId } = params;

  try {
    const listing = await prisma.listing.findUnique({
      where: {
        id: listingId,
      },
      include: {
        user: true,
      },
    });

    if (!listing) {
      throw new Error(`Listing with id ${listingId} not found`);
    }

    return {
      ...listing,
      createdAt: listing.createdAt.toISOString(),
      user: listing.user
        ? {
            ...listing.user,
            name: listing.user.name,
            createdAt: listing.user.createdAt.toISOString(),
            updatedAt: listing.user.updatedAt.toISOString(),
            emailVerified: listing.user.emailVerified?.toISOString() || null,
          }
        : null, // user байхгүй байвал null
    };
  } catch (error: any) {
    console.error("Error fetching listing:", error);
    throw new Error(error.message || "Something went wrong");
  }
}
