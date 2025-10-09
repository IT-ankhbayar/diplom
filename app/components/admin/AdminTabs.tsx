"use client";
import { useState } from "react";

interface AdminTabsProps {
  users: any[];
  reservations: any[];
  listings: any[];
}

const AdminTabs: React.FC<AdminTabsProps> = ({ users, reservations, listings }) => {
  const [tab, setTab] = useState("users");
  const [localUsers, setLocalUsers] = useState(users);
  const [localListings, setLocalListings] = useState(listings);
  const [localReservations, setLocalReservations] = useState(reservations);
  const [message, setMessage] = useState("");
  const [propertyMessage, setPropertyMessage] = useState("");
  const [orderMessage, setOrderMessage] = useState("");

  const handleUserDelete = async (userId: number) => {
    const res = await fetch(`/api/users/${userId}`, { method: "POST" });
    const data = await res.json();
    if (data.success) {
      setMessage("User deleted successfully.");
      setLocalUsers(localUsers.filter(u => u.id !== userId));
      setTab("users");
      setTimeout(() => setMessage(""), 2000);
    } else {
      setMessage("Failed to delete user.");
    }
  };

  const handlePropertyDelete = async (listingId: number) => {
    const res = await fetch(`/api/listings/${listingId}`, { method: "POST" });
    const data = await res.json();
    if (data.success) {
      setPropertyMessage("Property deleted successfully.");
      setLocalListings(localListings.filter(l => l.id !== listingId));
      setTab("properties");
      setTimeout(() => setPropertyMessage(""), 2000);
    } else {
      setPropertyMessage("Failed to delete property.");
    }
  };

  const handleOrderDelete = async (orderId: number) => {
    const res = await fetch(`/api/reservations/${orderId}`, { method: "DELETE" });
    const data = await res.json();
    if (data && data.count !== undefined ? data.count > 0 : data.success) {
      setOrderMessage("Order deleted successfully.");
      setLocalReservations(localReservations.filter(o => o.id !== orderId));
      setTab("orders");
      setTimeout(() => setOrderMessage(""), 2000);
    } else {
      setOrderMessage("Failed to delete order.");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
      <div className="flex gap-4 mb-6">
        <button className={`px-4 py-2 rounded-lg shadow-sm font-semibold transition-colors duration-150 ${tab === "users" ? "bg-blue-600 text-white" : "bg-gray-100 hover:bg-blue-100"}`} onClick={() => setTab("users")}>Users</button>
        <button className={`px-4 py-2 rounded-lg shadow-sm font-semibold transition-colors duration-150 ${tab === "orders" ? "bg-blue-600 text-white" : "bg-gray-100 hover:bg-blue-100"}`} onClick={() => setTab("orders")}>Orders</button>
        <button className={`px-4 py-2 rounded-lg shadow-sm font-semibold transition-colors duration-150 ${tab === "properties" ? "bg-blue-600 text-white" : "bg-gray-100 hover:bg-blue-100"}`} onClick={() => setTab("properties")}>Properties</button>
      </div>
      {tab === "users" && (
        <div className="overflow-x-auto mb-8">
          {message && <div className="mb-4 text-green-600 font-bold">{message}</div>}
          <table className="min-w-full bg-white border rounded-xl shadow-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="border px-4 py-2">ID</th>
                <th className="border px-4 py-2">Name</th>
                <th className="border px-4 py-2">Email</th>
                <th className="border px-4 py-2">Role</th>
                <th className="border px-4 py-2">Баталгаажуулах зураг</th>
                <th className="border px-4 py-2">Delete</th>
              </tr>
            </thead>
            <tbody>
              {localUsers.map(user => (
                <tr key={user.id} className="hover:bg-blue-50 transition-colors">
                  <td className="border px-4 py-2">{user.id}</td>
                  <td className="border px-4 py-2">{user.name}</td>
                  <td className="border px-4 py-2">{user.email}</td>
                  <td className="border px-4 py-2">{user.role}</td>
                  <td className="border px-4 py-2">
                    {user.verificationImage ? (
                      <div className="flex items-start gap-4">
                        <a href={user.verificationImage} target="_blank" rel="noopener noreferrer">
                          <img src={user.verificationImage} alt="ID" className="w-24 h-16 object-cover rounded shadow hover:scale-150 hover:z-10 transition-transform duration-200" />
                        </a>
                        <div className="flex flex-col justify-center min-w-[120px]">
                          {user.verificationImage && (
                            <button
                              onClick={async () => {
                                const newVerified = !user.verified;
                                await fetch(`/api/users/${user.id}`, {
                                  method: "PATCH",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ verified: newVerified })
                                });
                                setLocalUsers(localUsers.map(u => u.id === user.id ? { ...u, verified: newVerified } : u));
                              }}
                              className={`mb-1 ${user.verified ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-500 hover:bg-green-600'} text-white px-2 py-1 rounded transition w-full text-sm`}
                            >
                              {user.verified ? 'Баталгаажаагүй болгох' : 'Баталгаажуулах'}
                            </button>
                          )}
                          {user.verified && (
                            <span className="text-green-600 font-bold text-sm">Баталгаажсан ✔</span>
                          )}
                          {!user.verified && (
                            <span className="text-gray-500 text-xs mt-1">Зураг дээр дарж томоор харах боломжтой.</span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <span className="text-neutral-400">-</span>
                    )}
                  </td>
                  <td className="border px-4 py-2">
                    <button onClick={() => handleUserDelete(user.id)} className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded transition">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {tab === "orders" && (
        <div className="overflow-x-auto mb-8">
          {orderMessage && <div className="mb-4 text-green-600 font-bold">{orderMessage}</div>}
          <table className="min-w-full bg-white border rounded-xl shadow-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="border px-4 py-2">Order ID</th>
                <th className="border px-4 py-2">User ID</th>
                <th className="border px-4 py-2">Listing</th>
                <th className="border px-4 py-2">Start</th>
                <th className="border px-4 py-2">End</th>
                <th className="border px-4 py-2">Total Price</th>
                <th className="border px-4 py-2">Delete</th>
              </tr>
            </thead>
            <tbody>
              {localReservations.map(order => (
                <tr key={order.id} className="hover:bg-blue-50 transition-colors">
                  <td className="border px-4 py-2">{order.id}</td>
                  <td className="border px-4 py-2">{order.userId}</td>
                  <td className="border px-4 py-2">{order.listing?.title}</td>
                  <td className="border px-4 py-2">{new Date(order.startDate).toLocaleDateString()}</td>
                  <td className="border px-4 py-2">{new Date(order.endDate).toLocaleDateString()}</td>
                  <td className="border px-4 py-2">{order.totalPrice.toLocaleString()}₮</td>
                  <td className="border px-4 py-2">
                    <button onClick={() => handleOrderDelete(order.id)} className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded transition">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {tab === "properties" && (
        <div className="overflow-x-auto mb-8">
          {propertyMessage && <div className="mb-4 text-green-600 font-bold">{propertyMessage}</div>}
          <table className="min-w-full bg-white border rounded-xl shadow-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="border px-4 py-2">Property ID</th>
                <th className="border px-4 py-2">Title</th>
                <th className="border px-4 py-2">Category</th>
                <th className="border px-4 py-2">Price</th>
                <th className="border px-4 py-2">Owner ID</th>
                <th className="border px-4 py-2">Delete</th>
              </tr>
            </thead>
            <tbody>
              {localListings.map(listing => (
                <tr key={listing.id} className="hover:bg-blue-50 transition-colors">
                  <td className="border px-4 py-2">{listing.id}</td>
                  <td className="border px-4 py-2">{listing.title}</td>
                  <td className="border px-4 py-2">{listing.category}</td>
                  <td className="border px-4 py-2">{listing.price.toLocaleString()}₮</td>
                  <td className="border px-4 py-2">{listing.userId}</td>
                  <td className="border px-4 py-2">
                    <button onClick={() => handlePropertyDelete(listing.id)} className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded transition">Delete</button>
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

export default AdminTabs;
