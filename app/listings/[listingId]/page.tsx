import getCurrentUser from "@/app/actions/getCurrentUser";
import getListingById from "@/app/actions/getListingById";
import ClientOnly from "@/app/components/ClientOnly";
import EmptyState from "@/app/components/EmptyState";
import ListingClient from "./ListingClient";
import getReservations from "@/app/actions/getReservations";

interface IParams {
  listingId: string;
}

// Accept props as `any` to avoid PageProps typing constraints from Next.js build-time checks.
// We still validate and normalize `params` at runtime to get a strongly-typed `IParams`.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const dynamic = 'force-dynamic';
const ListingPage = async (props: any) => {
  const paramsRaw: unknown = props?.params;

  const isPromiseLike = (obj: unknown): obj is Promise<IParams> => {
    return typeof obj === 'object' && obj !== null && typeof (obj as { then?: unknown }).then === 'function';
  };

  const resolvedParams: IParams = isPromiseLike(paramsRaw) ? await paramsRaw : (paramsRaw as IParams);

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