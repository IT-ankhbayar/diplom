import getCurrentUser from "./actions/getCurrentUser";
import getListings, { IListingsParams } from "./actions/getListings";
import ClientOnly from "./components/ClientOnly";
import Container from "./components/Container";
import EmptyState from "./components/EmptyState";
import ListingCard from "./components/listings/ListingCard";
import Heading from "./components/Heading";

interface HomeProps {
  searchParams: IListingsParams
}

const Home = async ({ searchParams }: HomeProps) => {
  const listings = await getListings(searchParams);
  const currentUser = await getCurrentUser();

  if (listings.length === 0) {
    return (
      <ClientOnly>
        <EmptyState showReset />
      </ClientOnly>
    )
  }

  // Categorize listings
  const recentListings = [...listings].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 8);
  const luxuryListings = recentListings.filter(l => l.price > 500000);
  const cheapListings = recentListings.filter(l => l.price <= 100000);

  return (
    <Container>
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-gradient-to-br from-blue-50 to-white rounded-xl shadow-lg p-8 mt-8">
        <div className="w-full max-w-5xl mt-8 space-y-16">
          {/* Recently Added */}
          <div>
            <h2 className="text-2xl font-bold mb-8 mt-4 text-neutral-800">Сүүлд нэмэгдсэн</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {recentListings.length === 0 ? <div className="text-neutral-400">Сүүлд нэмэгдсэн байр алга</div> : recentListings.map((listing) => (
                <ListingCard currentUser={currentUser} key={listing.id} data={listing} />
              ))}
            </div>
          </div>
          {/* Luxury Properties */}
          <div>
            <h2 className="text-2xl font-bold mb-8 mt-4 text-neutral-800">Тансаг байрнууд</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {luxuryListings.length === 0 ? <div className="text-neutral-400">Тансаг байр олдсонгүй</div> : luxuryListings.map((listing) => (
                <ListingCard currentUser={currentUser} key={listing.id} data={listing} />
              ))}
            </div>
          </div>
          {/* Cheap Properties */}
          <div>
            <h2 className="text-2xl font-bold mb-8 mt-4 text-neutral-800">Хямд байрнууд</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {cheapListings.length === 0 ? <div className="text-neutral-400">Хямд байр олдсонгүй</div> : cheapListings.map((listing) => (
                <ListingCard currentUser={currentUser} key={listing.id} data={listing} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}

export default Home;