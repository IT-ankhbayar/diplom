"use client";

import { useState } from "react";
import Image from 'next/image';
import { AdminListing, AdminReservation, AdminUser } from "@/app/types/admin";
import AdminAnalytics from "@/app/admin/AnalyticsDashboard";
// Ensure this file exists in the same folder

interface AdminTabsProps {
  users: AdminUser[];
  reservations: AdminReservation[];
  listings: AdminListing[];
}

const AdminTabs: React.FC<AdminTabsProps> = ({ users, reservations, listings }) => {
  const [tab, setTab] = useState<string>("analytics");
  const [localUsers, setLocalUsers] = useState<AdminUser[]>(users);
  const [localListings, setLocalListings] = useState<AdminListing[]>(listings);
  const [localReservations, setLocalReservations] = useState<AdminReservation[]>(reservations);

  const [message, setMessage] = useState("");
  const [propertyMessage, setPropertyMessage] = useState("");
  const [orderMessage, setOrderMessage] = useState("");

  const handleUserDelete = async (userId: string) => {
    const res = await fetch(`/api/users/${userId}`, { method: "POST" });
    const data = await res.json();
    if (data.success) {
      setMessage("User deleted successfully.");
      setLocalUsers(localUsers.filter(u => u.id !== userId));
      setTimeout(() => setMessage(""), 2000);
    }
  };

  const handlePropertyDelete = async (listingId: string) => {
    const res = await fetch(`/api/listings/${listingId}`, { method: "POST" });
    const data = await res.json();
    if (data.success) {
      setPropertyMessage("Property deleted successfully.");
      setLocalListings(localListings.filter(l => l.id !== listingId));
      setTimeout(() => setPropertyMessage(""), 2000);
    }
  };

  const handleOrderDelete = async (orderId: string) => {
    const res = await fetch(`/api/reservations/${orderId}`, { method: "DELETE" });
    const data = await res.json();
    if (data && data.count !== undefined ? data.count > 0 : data.success) {
      setOrderMessage("Order deleted successfully.");
      setLocalReservations(localReservations.filter(o => o.id !== orderId));
      setTimeout(() => setOrderMessage(""), 2000);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mt-6">
      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 mb-8 bg-gray-50 p-1.5 rounded-2xl w-fit">
        {["analytics", "users", "orders", "properties"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${tab === t
              ? "bg-blue-600 text-white shadow-md"
              : "text-gray-500 hover:bg-gray-200"
              }`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Analytics Tab */}
      {tab === "analytics" && <AdminAnalytics />}

      {/* Users Tab */}
      {tab === "users" && (
        <div className="overflow-x-auto">
          {message && <div className="mb-4 p-3 bg-green-50 text-green-600 rounded-lg font-bold">{message}</div>}
          <table className="min-w-full border-separate border-spacing-0">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
              <tr>
                <th className="border-b px-4 py-4 text-left font-semibold">ID</th>
                <th className="border-b px-4 py-4 text-left font-semibold">Name</th>
                <th className="border-b px-4 py-4 text-left font-semibold">Email</th>
                <th className="border-b px-4 py-4 text-left font-semibold">Role</th>
                <th className="border-b px-4 py-4 text-left font-semibold">Verification</th>
                <th className="border-b px-4 py-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y">
              {localUsers.map(user => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-4 font-mono text-xs text-gray-400">{user.id.substring(0, 8)}...</td>
                  <td className="px-4 py-4 font-medium">{user.name}</td>
                  <td className="px-4 py-4 text-gray-500">{user.email}</td>
                  <td className="px-4 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    {user.verificationImage ? (
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 relative rounded-lg overflow-hidden border group cursor-zoom-in">
                          <Image src={user.verificationImage} alt="ID" fill className="object-cover group-hover:scale-110 transition" />
                        </div>
                        <button
                          onClick={async () => {
                            const newStatus = !user.verified;
                            await fetch(`/api/users/${user.id}`, {
                              method: "PATCH",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ verified: newStatus })
                            });
                            setLocalUsers(localUsers.map(u => u.id === user.id ? { ...u, verified: newStatus } : u));
                          }}
                          className={`text-xs px-2 py-1 rounded font-bold ${user.verified ? 'text-orange-600 bg-orange-50' : 'text-green-600 bg-green-50'}`}
                        >
                          {user.verified ? 'Revoke' : 'Verify'}
                        </button>
                      </div>
                    ) : "-"}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <button onClick={() => handleUserDelete(user.id)} className="text-red-500 hover:underline font-bold">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Orders Tab */}
      {tab === "orders" && (
        <div className="overflow-x-auto">
          {orderMessage && <div className="mb-4 p-3 bg-green-50 text-green-600 rounded-lg font-bold">{orderMessage}</div>}
          <table className="min-w-full border-separate border-spacing-0">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
              <tr>
                <th className="border-b px-4 py-4 text-left font-semibold">Order ID</th>
                <th className="border-b px-4 py-4 text-left font-semibold">Listing</th>
                <th className="border-b px-4 py-4 text-left font-semibold">Date Range</th>
                <th className="border-b px-4 py-4 text-left font-semibold">Total Price</th>
                <th className="border-b px-4 py-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y">
              {localReservations.map(order => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-4 font-mono text-xs text-gray-400">{order.id.substring(0, 8)}</td>
                  <td className="px-4 py-4 font-medium">{order.listing?.title}</td>
                  <td className="px-4 py-4 text-gray-500 text-xs">
                    {order.startDate && order.endDate ? (
                      `${new Date(order.startDate).toLocaleDateString()} - ${new Date(order.endDate).toLocaleDateString()}`
                    ) : (
                      "No dates provided"
                    )}
                  </td>
                  <td className="px-4 py-4 font-bold text-blue-600">
                    {order.totalPrice?.toLocaleString()}₮
                  </td>
                  <td className="px-4 py-4 text-right">
                    <button onClick={() => handleOrderDelete(order.id)} className="text-red-500 hover:underline font-bold">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Properties Tab */}
      {tab === "properties" && (
        <div className="overflow-x-auto">
          {propertyMessage && <div className="mb-4 p-3 bg-green-50 text-green-600 rounded-lg font-bold">{propertyMessage}</div>}
          <table className="min-w-full border-separate border-spacing-0">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
              <tr>
                <th className="border-b px-4 py-4 text-left font-semibold">Title</th>
                <th className="border-b px-4 py-4 text-left font-semibold">Category</th>
                <th className="border-b px-4 py-4 text-left font-semibold">Price</th>
                <th className="border-b px-4 py-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y">
              {localListings.map(listing => (
                <tr key={listing.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-4 font-medium">{listing.title}</td>
                  <td className="px-4 py-4"><span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">{listing.category}</span></td>
                  <td className="px-4 py-4">{listing.price?.toLocaleString()}₮</td>
                  <td className="px-4 py-4 text-right">
                    <button onClick={() => handlePropertyDelete(listing.id)} className="text-red-500 hover:underline font-bold">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminTabs; // <--- The missing piece!