"use client";
import Container from "../components/Container";
import Heading from "../components/Heading";
import TripsClient from "../trips/TripsClient";
import ReservationsClient from "../reservations/ReservationsClient";
import PropertiesClient from "../properties/PropertiesClient";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface ProfileTabsProps {
  trips: any[];
  orders: any[];
  properties: any[];
  currentUser: any;
}

const ProfileTabs: React.FC<ProfileTabsProps> = ({ trips, orders, properties, currentUser }) => {
  const [tab, setTab] = useState<'trips' | 'orders' | 'properties'>('trips');
  const router = useRouter();

  return (
    <Container>
      <div className="flex justify-end mb-4">
        <button
          className="bg-red-600 text-white px-4 py-2 rounded-lg shadow hover:bg-red-600 transition"
          onClick={() => router.push('/verify')}
        >
          Verify
        </button>
      </div>
      <Heading title="" subtitle="" />
      <div className="flex gap-4 mt-8 mb-8 justify-center">
        <button
          className={`px-4 py-2 rounded-lg font-semibold transition-colors duration-150 ${tab === 'trips' ? 'bg-red-600 text-white' : 'bg-gray-100 hover:bg-`blue`-100'}`}
          onClick={() => setTab('trips')}
        >Миний аяллууд</button>
        <button
          className={`px-4 py-2 rounded-lg font-semibold transition-colors duration-150 ${tab === 'orders' ? 'bg-red-600 text-white' : 'bg-gray-100 hover:bg-blue-100'}`}
          onClick={() => setTab('orders')}
        >Миний захиалгууд</button>
        <button
          className={`px-4 py-2 rounded-lg font-semibold transition-colors duration-150 ${tab === 'properties' ? 'bg-red-600 text-white' : 'bg-gray-100 hover:bg-blue-100'}`}
          onClick={() => setTab('properties')}
        >Миний үл хөдлөх хөрөнгө</button>
      </div>
      {tab === 'trips' && (
        trips.length > 0 ? (
          <TripsClient reservations={trips} currentUser={currentUser} />
        ) : (
          <div className="flex justify-center items-center h-64">
            <span className="text-neutral-500 text-lg">Аялал байхгүй байна</span>
          </div>
        )
      )}
      {tab === 'orders' && (
        orders.length > 0 ? (
          <ReservationsClient reservations={orders} currentUser={currentUser} />
        ) : (
          <div className="flex justify-center items-center h-64">
            <span className="text-neutral-500 text-lg">Захиалга байхгүй байна</span>
          </div>
        )
      )}
      {tab === 'properties' && (
        properties.length > 0 ? (
          <PropertiesClient listings={properties} currentUser={currentUser} />
        ) : (
          <div className="flex justify-center items-center h-64">
            <span className="text-neutral-500 text-lg">Өмч байхгүй байна</span>
          </div>
        )
      )}
    </Container>
  );
};

export default ProfileTabs;
