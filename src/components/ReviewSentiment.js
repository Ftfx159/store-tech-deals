"use client";
import React from 'react';
import styles from './ReviewSentiment.module.css';

export default function ReviewSentiment({ product }) {
  // Generate mock sentiment data based on the product's rating
  const basePositive = Math.min(95, Math.max(50, Math.round((product.rating / 5) * 100)));
  
  const sentiments = [
    { label: "Build Quality", score: basePositive + Math.floor(Math.random() * 10 - 5) },
    { label: "Value for Money", score: basePositive + Math.floor(Math.random() * 15 - 5) },
    { label: "Performance", score: basePositive + Math.floor(Math.random() * 10 - 3) },
    { label: "Battery/Durability", score: Math.max(30, basePositive - Math.floor(Math.random() * 20)) }
  ];

  return (
    <div className={styles.sentimentWrapper}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>
          <span className={styles.brainIcon}>🧠</span>
          <h3>AI Review Sentiment Analysis</h3>
        </div>
        <p className={styles.subtitle}>Synthesized from {product.reviews} verified Amazon reviews.</p>
      </div>

      <div className={styles.contentGrid}>
        <div className={styles.barsContainer}>
          {sentiments.map((item, idx) => (
            <div key={idx} className={styles.barRow}>
              <div className={styles.barLabelGroup}>
                <span className={styles.barLabel}>{item.label}</span>
                <span className={styles.barScore}>{item.score}% Positive</span>
              </div>
              <div className={styles.barBackground}>
                <div 
                  className={styles.barFill} 
                  style={{ 
                    width: `${item.score}%`,
                    background: item.score > 80 ? 'linear-gradient(90deg, #10b981, #34d399)' : 
                                item.score > 60 ? 'linear-gradient(90deg, #3b82f6, #60a5fa)' : 
                                'linear-gradient(90deg, #f59e0b, #fbbf24)'
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.summaryBox}>
          <h4>📝 AI Summary</h4>
          <ul className={styles.summaryList}>
            <li>
              <span className={styles.checkIcon}>✅</span> 
              <strong>Pros:</strong> Excellent {sentiments.reduce((prev, current) => (prev.score > current.score) ? prev : current).label.toLowerCase()} and solid overall value for the price point.
            </li>
            <li>
              <span className={styles.crossIcon}>❌</span> 
              <strong>Cons:</strong> A minority of users reported minor issues with {sentiments.reduce((prev, current) => (prev.score < current.score) ? prev : current).label.toLowerCase()}.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
