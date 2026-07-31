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
      <div className={styles.notificationCard}>
        
        <div className={styles.iconContainer}>
          <span className={styles.pulseIcon}>🔥</span>
        </div>

        <div className={styles.textContent}>
          <div className={styles.badge}>Starts 7th Aug</div>
          <h4>Great Freedom Sale</h4>
          <p>Massive Exchange Offers & 10% HDFC Discount!</p>
        </div>

        <div className={styles.actionContainer}>
          <Link href="/search?q=great+freedom+sale" onClick={handleDismiss} className={styles.ctaButton}>
            Sneak Peek
          </Link>
          <button onClick={handleDismiss} className={styles.closeButton} aria-label="Close">
            &times;
          </button>
        </div>

      </div>
    </div>
  );
}
