"use client";
import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './SecretDealVault.module.css';

export default function SecretDealVault() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleUnlock = () => {
    if (isUnlocked || isAnimating) return;
    setIsAnimating(true);
    
    // Fake unlocking sequence
    setTimeout(() => {
      setIsAnimating(false);
      setIsUnlocked(true);
    }, 2000); // 2 seconds of shaking animation
  };

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
            <h3 style={{ fontSize: '1.2rem', lineHeight: '1.4' }}>Samsung 49-Inch Odyssey G9 OLED Curved Gaming Monitor</h3>
            
            <div className={styles.priceRow}>
              <span className={styles.discountBadge}>-47% OFF</span>
              <span className={styles.currentPrice}>₹1,09,999</span>
              <span className={styles.originalPrice}>₹2,10,000</span>
            </div>
            
            <p className={styles.timerText}>⏳ Deal expires in 04:59 minutes!</p>
            
            <Link href="/product/samsung-odyssey-g9" className={styles.claimBtn}>
              Claim Deal Now
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
