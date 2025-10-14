import getCurrentUser from "@/app/actions/getCurrentUser";
import getListingById from "@/app/actions/getListingById";
import ClientOnly from "@/app/components/ClientOnly";
import EmptyState from "@/app/components/EmptyState";
import ListingClient from "./ListingClient";
import getReservations from "@/app/actions/getReservations";

interface IParams {
  listingId: string;
}

const ListingPage = async ({ params }: { params: IParams | Promise<IParams> }) => {
  // Next may pass params as a Promise-like in some environments; normalize it here.
  const isPromiseLike = (obj: unknown): obj is Promise<IParams> => {
    return typeof obj === 'object' && obj !== null && typeof (obj as { then?: unknown }).then === 'function';
  };

  const resolvedParams: IParams = isPromiseLike(params) ? await params : (params as IParams);

  const listing = await getListingById(resolvedParams);
  const reservations = await getReservations(resolvedParams);
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