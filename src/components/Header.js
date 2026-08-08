"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import SearchBar from "./SearchBar";
import WishlistDrawer from "./WishlistDrawer";
import { useStorage } from "@/context/StorageContext";
import styles from "./Header.module.css";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { wishlist, isLoaded } = useStorage();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`${styles.header} ${isScrolled ? styles.scrolled : ""}`}>
      <div className={`container ${styles.headerContainer}`}>
        <a href="/" className={styles.logo}>
          <span className="brand-luxury">Orvessa</span>
        </a>
        
        <SearchBar />
        
        <nav className={styles.nav}>
          <Link href="/setup-builder" className={styles.navLink} style={{ color: 'var(--accent-success)', fontWeight: 'bold' }}>🤖 AI Builder</Link>
          <Link href="/flash-deals" className={styles.navLink}>
            <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '6px', display: 'inline-block', verticalAlign: 'text-bottom'}}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg> 
            Flash Deals
          </Link>

          <button 
            className={`${styles.navLink} ${styles.wishlistBtn}`} 
            onClick={() => setIsDrawerOpen(true)}
            aria-label="View Saved Deals"
          >
            <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
            <span className={styles.navText}>Saved Deals</span>
            {isLoaded && wishlist.length > 0 && (
              <span className={styles.badge}>{wishlist.length}</span>
            )}
          </button>
        </nav>
        
        {/* Wishlist Drawer rendered outside standard flow */}
        <WishlistDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
      </div>
    </header>
  );
}
