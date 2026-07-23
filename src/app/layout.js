import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import AIChatbot from "@/components/AIChatbot";
import FomoEngine from "@/components/FomoEngine";
import Footer from "@/components/Footer";
import { ToastProvider } from "@/context/ToastContext";
import { StorageProvider } from "@/context/StorageContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "FTFX Tech Deals | Smart Tech. Bigger Savings.",
  description: "Discover the best daily deals, lightning offers, coupons, and price drops on genuine electronic products from Amazon India.",
  keywords: "technology, electronics, amazon deals, laptops, gadgets, india, discounts, tech sales",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <StorageProvider>
          <ToastProvider>
            <Header />
            <main>{children}</main>
            <AIChatbot />
            <FomoEngine />
            <Footer />
          </ToastProvider>
        </StorageProvider>
      </body>
    </html>
  );
}
