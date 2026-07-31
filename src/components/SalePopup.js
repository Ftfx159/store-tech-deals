"use client";
import { useState, useEffect } from "react";
import styles from "./SalePopup.module.css";
import Link from "next/link";

export default function SalePopup() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show popup 2 seconds after page load
    const timer = setTimeout(() => {
      // Check if user already dismissed it this session
      if (!sessionStorage.getItem("salePopupDismissed")) {
        setIsVisible(true);
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem("salePopupDismissed", "true");
  };

  if (!isVisible) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.popupContainer}>
        <button onClick={handleDismiss} className={styles.closeButton} aria-label="Close">
          &times;
        </button>
        
        <div className={styles.popupHeader}>
          <div className={styles.badge}>Starts 7th Aug</div>
          <h2>Great <br/>Freedom Sale</h2>
          <p className={styles.subtitle}>Big savings for everyone on Premium Tech!</p>
        </div>

        <div className={styles.popupBody}>
          <ul className={styles.benefits}>
            <li>
              <span className={styles.icon}>🔄</span>
              <span>Massive Exchange Offers</span>
            </li>
            <li>
              <span className={styles.icon}>💳</span>
              <span>No Cost EMI available</span>
            </li>
            <li>
              <span className={styles.icon}>🏦</span>
              <span>10% Instant Discount on HDFC</span>
            </li>
          </ul>
          
          <Link href="/search?q=great+freedom+sale" onClick={handleDismiss} className={styles.ctaButton}>
            Sneak Peek Deals Now
          </Link>
        </div>
      </div>
    </div>
  );
}
