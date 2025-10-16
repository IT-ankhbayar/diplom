export const dynamic = 'force-dynamic';

import type { Metadata } from "next";
import 'leaflet/dist/leaflet.css';
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from './components/navbar/Navbar';
import ClientOnly from "./components/ClientOnly";
import RegisterModal from "./components/modals/RegisterModal";
import LoginModal from "./components/modals/LoginModal";
import RentModal from "./components/modals/RentModal";
import ToasterProvider from "./providers/ToasterProvider";
import Script from "next/script";

import getCurrentUser from "./actions/getCurrentUser";
import SearchModal from "./components/modals/SearchModal";

// This layout uses server-side headers/session data (getCurrentUser).
// Tell Next.js this route must be rendered dynamically.




const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hotel Ordering System",
  description: "Hotel Ordering System",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const currentUser = await getCurrentUser();
  return (
    <html lang="en">
      <head>
        <Script
          src="https://widget.cloudinary.com/v2.0/global/all.js"
          strategy="beforeInteractive"
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ClientOnly>
          <ToasterProvider />
          <SearchModal/>
          <RentModal/>
          <LoginModal/>
          <RegisterModal/>
          <Navbar currentUser={currentUser}/>
        </ClientOnly>
        <div className="pb-20 pt-28">
          {typeof children === 'string' && children.trim() === '' ? null : children}
        </div>
        {currentUser?.role === 'admin' && (
          <div className="fixed bottom-6 right-6 z-50">
            <a href="/admin" className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition">
              Admin Dashboard
            </a>
          </div>
        )}
      </body>
    </html>
  );
}
