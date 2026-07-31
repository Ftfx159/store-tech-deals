import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import AIChatbot from "@/components/AIChatbot";
import FomoEngine from "@/components/FomoEngine";
import Footer from "@/components/Footer";
import GlobalDealBanner from "@/components/GlobalDealBanner";
import { ToastProvider } from "@/context/ToastContext";
import { StorageProvider } from "@/context/StorageContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  metadataBase: new URL('https://ftfxtechdeals.com'),
  title: "FTFX Tech Deals | Smart Tech. Bigger Savings.",
  description: "Discover the best daily deals, lightning offers, coupons, and price drops on genuine electronic products from Amazon India.",
  keywords: "technology, electronics, amazon deals, laptops, gadgets, india, discounts, tech sales",
  openGraph: {
    title: "FTFX Tech Deals | Smart Tech. Bigger Savings.",
    description: "Discover the best daily deals, lightning offers, coupons, and price drops on genuine electronic products from Amazon India.",
    url: "https://ftfxtechdeals.com",
    siteName: "FTFX Tech Deals",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FTFX Tech Deals | Smart Tech. Bigger Savings.",
    description: "Discover the best daily deals, lightning offers, coupons, and price drops on genuine electronic products from Amazon India.",
  },
};

const globalSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "url": "https://ftfxtechdeals.com/",
      "name": "FTFX Tech Deals",
      "description": "Discover the best daily deals, lightning offers, coupons, and price drops on genuine electronic products from Amazon India.",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://ftfxtechdeals.com/search?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    },
    {
      "@type": "Organization",
      "name": "FTFX Tech Deals",
      "url": "https://ftfxtechdeals.com/",
      "logo": "https://ftfxtechdeals.com/icon.png",
      "sameAs": []
    }
  ]
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(globalSchema) }}
        />
        <StorageProvider>
          <ToastProvider>
            <GlobalDealBanner />
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
