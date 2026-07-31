"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './DealOfTheHour.module.css';

export default function DealOfTheHour({ deal }) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    // Calculate time until next top of the hour
    const updateTimer = () => {
      const now = new Date();
      const nextHour = new Date(now);
      nextHour.setHours(now.getHours() + 1, 0, 0, 0);
      
      const diff = nextHour - now;
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);
      
      setTimeLeft(`${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!deal) return null;

  const savings = deal.originalPrice - deal.discountedPrice;
  const percentage = Math.round((savings / deal.originalPrice) * 100);

  return (
    <div className={styles.bannerWrapper}>
      <div className={styles.bannerContainer}>
        <div className={styles.fomoBadge}>
          <span className={styles.pulseIcon}>⚡</span>
          DEAL OF THE HOUR
        </div>
        
        <div className={styles.dealContent}>
          <div className={styles.timerBox}>
            <span className={styles.timerLabel}>Ends In</span>
            <span className={styles.timerDigits}>{timeLeft}</span>
          </div>

          <div className={styles.productInfo}>
            <h3 className={styles.productName}>{deal.name.slice(0, 50)}...</h3>
            <div className={styles.priceData}>
              <span className={styles.currentPrice}>₹{deal.discountedPrice.toLocaleString('en-IN')}</span>
              <span className={styles.discountBadge}>-{percentage}%</span>
            </div>
          </div>

          <Link href={`/product/${deal.id}`} className={styles.claimButton}>
            Claim Now &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
