"use client";
import { useEffect, useRef } from "react";
import { useStorage } from "@/context/StorageContext";
import ProductCard from "./ProductCard";

export default function RecentlyViewed({ currentProduct }) {
  const { recentlyViewed, addRecentlyViewed, isLoaded } = useStorage();
  const hasAddedRef = useRef(false);

  useEffect(() => {
    // Only add to recently viewed once per mount, and only if data is loaded
    if (isLoaded && currentProduct && !hasAddedRef.current) {
      addRecentlyViewed(currentProduct);
      hasAddedRef.current = true;
    }
  }, [isLoaded, currentProduct, addRecentlyViewed]);

  if (!isLoaded) return null;

  // Filter out the current product so we don't show what they are currently looking at
  const displayItems = recentlyViewed.filter(p => p.id !== currentProduct.id).slice(0, 4);

  if (displayItems.length === 0) return null;

  return (
    <section style={{ marginTop: '60px' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '24px' }}>Recently Viewed Deals</h2>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '24px'
      }}>
        {displayItems.map(p => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
