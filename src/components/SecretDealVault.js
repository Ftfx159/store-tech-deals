"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './SecretDealVault.module.css';

export default function SecretDealVault({ deals = [] }) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [secretDeal, setSecretDeal] = useState(null);

  useEffect(() => {
    if (deals && deals.length > 0) {
      // Pick a random deal from the top lightning deals
      const randomDeal = deals[Math.floor(Math.random() * deals.length)];
      setSecretDeal(randomDeal);
    }
  }, [deals]);

  const handleUnlock = () => {
    if (isUnlocked || isAnimating) return;
    setIsAnimating(true);
    
    setTimeout(() => {
      setIsAnimating(false);
      setIsUnlocked(true);
    }, 2000); 
  };

  const formatPrice = (price) => {
    return `₹${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(price)}`;
  };

  if (!secretDeal) return null;

  const discountPercentage = Math.round(((secretDeal.originalPrice - secretDeal.discountedPrice) / secretDeal.originalPrice) * 100);

  return (
    <div className={styles.vaultContainer}>
      {!isUnlocked ? (
        <div className={`${styles.lockedState} ${isAnimating ? styles.shaking : ''}`} onClick={handleUnlock}>
          <div className={styles.glowRing}></div>
          <div className={styles.vaultBox}>
            <span className={styles.lockIcon}>🔒</span>
            <h3>Unlock Today's Secret Deal</h3>
            <p>Click to reveal a massive, time-sensitive discount.</p>
          </div>
        </div>
      ) : (
        <div className={styles.unlockedState}>
          <div className={styles.confetti}>🎉</div>
          <div className={styles.dealContent}>
            <div className={styles.secretBadge}>SECRET UNLOCKED</div>
            <h3 style={{ fontSize: '1.2rem', lineHeight: '1.4', marginBottom: '15px' }} title={secretDeal.name}>
              {secretDeal.name.length > 60 ? secretDeal.name.substring(0, 60) + '...' : secretDeal.name}
            </h3>
            
            <div className={styles.priceRow}>
              {discountPercentage > 0 && <span className={styles.discountBadge}>-{discountPercentage}% OFF</span>}
              <span className={styles.currentPrice}>{formatPrice(secretDeal.discountedPrice)}</span>
              {secretDeal.originalPrice > secretDeal.discountedPrice && (
                <span className={styles.originalPrice}>{formatPrice(secretDeal.originalPrice)}</span>
              )}
            </div>
            
            <p className={styles.timerText}>⏳ Deal expires in 04:59 minutes!</p>
            
            <Link href={`/product/${secretDeal.id}`} className={styles.claimBtn}>
              Claim Deal Now
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
