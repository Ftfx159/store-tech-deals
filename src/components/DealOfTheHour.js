"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './DealOfTheHour.module.css';

export default function DealOfTheHour({ deals }) {
  const [timeLeft, setTimeLeft] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

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
    const timerInterval = setInterval(updateTimer, 1000);
    
    // Shuffle deals every 6 seconds if multiple
    let shuffleInterval;
    if (deals && deals.length > 1) {
      shuffleInterval = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % deals.length);
      }, 6000);
    }

    return () => {
      clearInterval(timerInterval);
      if (shuffleInterval) clearInterval(shuffleInterval);
    };
  }, [deals]);

  if (!deals || deals.length === 0) return null;
  const deal = deals[currentIndex];

  const savings = deal.originalPrice - deal.discountedPrice;
  const percentage = Math.round((savings / deal.originalPrice) * 100);

  let affiliateUrl = deal.amazonUrl || `https://www.amazon.in/dp/${deal.id}`;
  if (!affiliateUrl.includes('tag=')) {
    affiliateUrl += (affiliateUrl.includes('?') ? '&' : '?') + 'tag=ftfx-21';
  }

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

          <a href={affiliateUrl} target="_blank" rel="noopener noreferrer" className={styles.claimButton}>
            Claim Now &rarr;
          </a>
        </div>
      </div>
    </div>
  );
}
