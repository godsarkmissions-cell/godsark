import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LiveTVWidget from "@/components/LiveTVWidget";
import IntroVideo from "@/components/IntroVideo";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "God's Ark Missions",
  description: "Official website of God's Ark Missions church.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <IntroVideo />
          <Toaster position="top-right" />
          <Sidebar />
          <Navbar />
          <main className="min-h-[70vh]">{children}</main>
          <Footer />
          {/* Floating 24/7 Live TV player - bottom-right on every page except /admin */}
          <LiveTVWidget />
        </AuthProvider>
      </body>
    </html>
  );
}