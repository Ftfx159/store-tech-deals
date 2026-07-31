"use client";
import React from 'react';
import styles from './DealQualityScore.module.css';

export default function DealQualityScore({ currentPrice, originalPrice, priceHistory }) {
  // If we don't have enough history, use original vs current
  let minPrice = currentPrice;
  let maxPrice = originalPrice > currentPrice ? originalPrice : currentPrice;
  
  if (priceHistory && priceHistory.length > 0) {
    minPrice = Math.min(currentPrice, ...priceHistory.map(h => h.price));
    maxPrice = Math.max(maxPrice, ...priceHistory.map(h => h.price));
  }

  // Calculate score 0-100 (100 = lowest price ever)
  let score = 50;
  if (maxPrice > minPrice) {
    const range = maxPrice - minPrice;
    const position = maxPrice - currentPrice;
    score = Math.round((position / range) * 100);
  } else if (currentPrice < originalPrice) {
    // Has a discount but no history fluctuations
    score = 80;
  }

  // Determine styling and text
  let verdict = "Fair Deal";
  let icon = "👍";
  let gaugeClass = styles.gaugeFair;
  
  if (score >= 90) {
    verdict = "Scorching Deal! (Lowest Price)";
    icon = "🔥";
    gaugeClass = styles.gaugeHot;
  } else if (score >= 70) {
    verdict = "Great Deal";
    icon = "⭐";
    gaugeClass = styles.gaugeGood;
  } else if (score <= 20) {
    verdict = "Cold Deal (Wait for a drop)";
    icon = "❄️";
    gaugeClass = styles.gaugeCold;
  }

  return (
    <div className={styles.scoreContainer}>
      <div className={styles.header}>
        <div className={styles.iconBox}>{icon}</div>
        <div className={styles.textData}>
          <span className={styles.label}>AI Deal Verdict</span>
          <span className={`${styles.verdict} ${gaugeClass}`}>{verdict}</span>
        </div>
      </div>
      
      <div className={styles.gaugeTrack}>
        <div 
          className={`${styles.gaugeFill} ${gaugeClass}`} 
          style={{ width: `${Math.max(5, score)}%` }}
        />
      </div>
      
      <div className={styles.footer}>
        <span>Historical High</span>
        <span>Best Price</span>
      </div>
    </div>
  );
}
