"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';

const StorageContext = createContext();

export function StorageProvider({ children }) {
  const [wishlist, setWishlist] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from local storage on mount (avoids hydration mismatch)
  useEffect(() => {
    try {
      const savedWishlist = localStorage.getItem('ftfx_wishlist');
      if (savedWishlist) setWishlist(JSON.parse(savedWishlist));

      const savedRecent = localStorage.getItem('ftfx_recent');
      if (savedRecent) setRecentlyViewed(JSON.parse(savedRecent));
    } catch (e) {
      console.error("Failed to load local storage", e);
    }
    setIsLoaded(true);
  }, []);

  // Save wishlist
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('ftfx_wishlist', JSON.stringify(wishlist));
    }
  }, [wishlist, isLoaded]);

  // Save recently viewed
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('ftfx_recent', JSON.stringify(recentlyViewed));
    }
  }, [recentlyViewed, isLoaded]);

  // Wishlist Actions
  const toggleWishlist = (product) => {
    setWishlist(prev => {
      const exists = prev.some(item => item.id === product.id);
      if (exists) {
        return prev.filter(item => item.id !== product.id);
      } else {
        return [...prev, product];
      }
    });
  };

  const isInWishlist = (productId) => {
    return wishlist.some(item => item.id === productId);
  };

  // Recently Viewed Actions
  const addRecentlyViewed = (product) => {
    setRecentlyViewed(prev => {
      // Remove if it already exists to put it at the front
      const filtered = prev.filter(item => item.id !== product.id);
      // Keep only the last 10 items
      return [product, ...filtered].slice(0, 10);
    });
  };

  return (
    <StorageContext.Provider value={{
      wishlist,
      toggleWishlist,
      isInWishlist,
      recentlyViewed,
      addRecentlyViewed,
      isLoaded
    }}>
      {children}
    </StorageContext.Provider>
  );
}

export function useStorage() {
  return useContext(StorageContext);
}
