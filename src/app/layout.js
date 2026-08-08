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
  metadataBase: new URL('https://orvessa.com'),
  title: "Orvessa | Smart Tech. Bigger Savings.",
  description: "Discover the best daily deals, lightning offers, coupons, and price drops on genuine electronic products from Amazon India.",
  keywords: ["technology", "electronics", "amazon deals", "laptops", "gadgets", "india", "discounts", "tech sales", "PC builder", "gaming setup", "Orvessa"],
  authors: [{ name: "Orvessa Team" }],
  creator: "Orvessa",
  publisher: "Orvessa",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: "Orvessa | Smart Tech. Bigger Savings.",
    description: "Discover the best daily deals, lightning offers, coupons, and price drops on genuine electronic products from Amazon India.",
    url: "https://orvessa.com",
    siteName: "Orvessa",
    images: [
      {
        url: "/icon.png",
        width: 800,
        height: 600,
        alt: "Orvessa - Smart Tech. Bigger Savings.",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Orvessa | Smart Tech. Bigger Savings.",
    description: "Discover the best daily deals, lightning offers, coupons, and price drops on genuine electronic products from Amazon India.",
    images: ["/icon.png"],
  },
};

const globalSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "url": "https://orvessa.com/",
      "name": "Orvessa",
      "description": "Discover the best daily deals, lightning offers, coupons, and price drops on genuine electronic products from Amazon India.",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://orvessa.com/search?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    },
    {
      "@type": "Organization",
      "name": "Orvessa",
      "url": "https://orvessa.com/",
      "logo": "https://orvessa.com/icon.png",
      "sameAs": []
    }
  ]
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://m.media-amazon.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://images-eu.ssl-images-amazon.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://image.pollinations.ai" crossOrigin="anonymous" />
      </head>
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
