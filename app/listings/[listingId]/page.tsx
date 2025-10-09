import getCurrentUser from "@/app/actions/getCurrentUser";
import getListingById from "@/app/actions/getListingById";
import ClientOnly from "@/app/components/ClientOnly";
import EmptyState from "@/app/components/EmptyState";
import ListingClient from "./ListingClient";
import getReservations from "@/app/actions/getReservations";

interface IParams {
  listingId: string; 
}

const ListingPage = async ({ params }: { params: IParams }) => {
  const listing = await getListingById(params);
  const reservations = await getReservations(params);
  const currentUser = await getCurrentUser();

  if (!listing) {
    return (
      <ClientOnly>
        <EmptyState />
      </ClientOnly>
    );
  }

  return (
    <ClientOnly>
      <ListingClient
        listing={{
          ...listing,
          user: listing.user ?? {
            id: "",
            name: null,
            email: null,
            image: null,
            emailVerified: null,
            role: "USER",
            verified: false,
            hashedPassword: null,
            favoriteIds: [],
            verificationImage: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          imageSrc: Array.isArray(listing.imageSrc)
            ? listing.imageSrc
            : [listing.imageSrc],
        }}
        reservations={reservations ?? []}
        currentUser={currentUser ?? null}
      />
    </ClientOnly>
  );
};

export default ListingPage;