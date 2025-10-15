import ClientOnly from "../components/ClientOnly";
import getCurrentUser from '../actions/getCurrentUser';
import getReservations from '../actions/getReservations';
import getListings from '../actions/getListings';
import ProfileTabs from "./ProfileTabs";
import EmptyState from "../components/EmptyState";

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return (
      <ClientOnly>
        <EmptyState title="Зөвшөөрөлгүй" subtitle="Та нэвтэрнэ үү" />
      </ClientOnly>
    );
  }

  const trips = await getReservations({ userId: currentUser!.id });
  const orders = await getReservations({ authorId: currentUser!.id });
  const properties = await getListings({ userId: currentUser!.id });

  return (
    <ClientOnly>
      <ProfileTabs
        trips={trips}
        orders={orders}
        properties={properties}
        currentUser={currentUser}
      />
    </ClientOnly>
  );
}
