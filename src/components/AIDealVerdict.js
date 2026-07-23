"use client";
import { useMemo } from 'react';
import styles from './AIDealVerdict.module.css';

export default function AIDealVerdict({ discountPercentage, rating, reviews }) {
  const score = useMemo(() => {
    let base = 40;
    
    // Discount is king (max 40 points)
    const discountScore = Math.min((discountPercentage / 70) * 40, 40);
    
    // Rating matters (max 15 points for a 5.0)
    const ratingScore = Math.max(0, (rating - 3) * 7.5);
    
    // Social proof matters (max 5 points)
    const reviewScore = Math.min((reviews / 1000) * 5, 5);
    
    let total = Math.round(base + discountScore + ratingScore + reviewScore);
    return Math.min(Math.max(total, 0), 99); // Max 99 to leave room for perfection
  }, [discountPercentage, rating, reviews]);

  let label = "Standard Value";
  let theme = styles.standard;
  
  if (score >= 90) {
    label = "Legendary Deal 🔥";
    theme = styles.legendary;
  } else if (score >= 80) {
    label = "Great Buy";
    theme = styles.great;
  } else if (score >= 70) {
    label = "Good Value";
    theme = styles.good;
  }

  return (
    <div className={`${styles.verdictContainer} ${theme}`}>
      <div className={styles.iconBox}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
        </svg>
      </div>
      <div className={styles.content}>
        <span className={styles.scoreLabel}>AI Deal Verdict</span>
        <div className={styles.scoreRow}>
          <span className={styles.scoreValue}>{score}/100</span>
          <span className={styles.scoreText}>- {label}</span>
        </div>
      </div>
    </div>
  );
}
