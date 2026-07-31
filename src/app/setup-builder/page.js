"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './SetupBuilder.module.css';
import BuyButton from '@/components/BuyButton';

export default function SetupBuilderPage() {
  const [budget, setBudget] = useState(100000);
  const [goal, setGoal] = useState('gaming');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const goals = [
    { id: 'gaming', name: 'Gaming Setup', icon: '🎮' },
    { id: 'productivity', name: 'Work / Productivity', icon: '💼' },
    { id: 'streaming', name: 'Streaming & Creator', icon: '🎥' },
  ];

  const handleBuild = async () => {
    setLoading(true);
    // In a real implementation, this would fetch from /api/build-setup
    // For now, we simulate an API call and return mock data from the database
    setTimeout(() => {
      setResult({
        goal: goals.find(g => g.id === goal).name,
        totalPrice: budget * 0.9,
        originalPrice: budget * 1.2,
        products: [
          {
            id: 'B0C4Z4FB6C', // From fallback db
            name: 'NVIDIA GeForce RTX 4060 Ti 8GB Graphic Card',
            category: 'PC Parts',
            discountedPrice: 38990,
            originalPrice: 45000,
            imageUrl: 'https://m.media-amazon.com/images/I/612hBw-i61L._SX679_.jpg',
            amazonUrl: 'https://www.amazon.in/dp/B0C4Z4FB6C'
          },
          {
            id: 'B0B9G5D9H3',
            name: 'Intel Core i5-13600K Desktop Processor',
            category: 'PC Parts',
            discountedPrice: 28499,
            originalPrice: 35000,
            imageUrl: 'https://m.media-amazon.com/images/I/61Nl5c9vXJL._SX679_.jpg',
            amazonUrl: 'https://www.amazon.in/dp/B0B9G5D9H3'
          },
          {
            id: 'B006JH8T3S',
            name: 'Logitech C920 HD Pro Webcam',
            category: 'Creator Tech',
            discountedPrice: 6495,
            originalPrice: 8995,
            imageUrl: 'https://m.media-amazon.com/images/I/71iNwnHT3IL._SX679_.jpg',
            amazonUrl: 'https://www.amazon.in/dp/B006JH8T3S'
          }
        ]
      });
      setLoading(false);
    }, 1500);
  };

  return (
    <div className={`container ${styles.builderContainer}`}>
      <div className={styles.headerBox}>
        <div className={styles.aiBadge}>✨ AI Powered</div>
        <h1 className={styles.title}>Smart Ecosystem Builder</h1>
        <p className={styles.subtitle}>Tell us your goal and budget. We'll instantly find the best active deals to build your dream setup without overspending.</p>
      </div>

      <div className={styles.mainGrid}>
        {/* Input Form */}
        <div className={styles.inputCard}>
          <h3>1. What are you building for?</h3>
          <div className={styles.goalGrid}>
            {goals.map(g => (
              <button 
                key={g.id} 
                className={`${styles.goalBtn} ${goal === g.id ? styles.active : ''}`}
                onClick={() => setGoal(g.id)}
              >
                <span className={styles.goalIcon}>{g.icon}</span>
                {g.name}
              </button>
            ))}
          </div>

          <h3 style={{marginTop: '32px'}}>2. What is your max budget?</h3>
          <div className={styles.budgetDisplay}>₹{budget.toLocaleString('en-IN')}</div>
          <input 
            type="range" 
            min="20000" 
            max="300000" 
            step="5000"
            value={budget}
            onChange={(e) => setBudget(Number(e.target.value))}
            className={styles.slider}
          />
          <div className={styles.sliderLabels}>
            <span>₹20k</span>
            <span>₹3L</span>
          </div>

          <button 
            className={styles.generateBtn} 
            onClick={handleBuild}
            disabled={loading}
          >
            {loading ? '🧠 AI is searching deals...' : 'Generate My Setup &rarr;'}
          </button>
        </div>

        {/* Results Area */}
        <div className={styles.resultCard}>
          {!result && !loading && (
            <div className={styles.emptyState}>
              <div className={styles.robotIcon}>🤖</div>
              <p>Ready to build? Set your budget and click Generate.</p>
            </div>
          )}

          {loading && (
            <div className={styles.loadingState}>
              <div className={styles.spinner}></div>
              <p>Scanning 1,000+ active Amazon discounts...</p>
            </div>
          )}

          {result && !loading && (
            <div className={styles.successState}>
              <div className={styles.resultHeader}>
                <h2>Your Optimal {result.goal}</h2>
                <div className={styles.savingsBox}>
                  You Save ₹{(result.originalPrice - result.totalPrice).toLocaleString('en-IN')}!
                </div>
              </div>

              <div className={styles.productList}>
                {result.products.map(p => (
                  <div key={p.id} className={styles.productRow}>
                    <img src={p.imageUrl} alt={p.name} className={styles.rowImage} />
                    <div className={styles.rowInfo}>
                      <Link href={`/product/${p.id}`} className={styles.rowName}>{p.name.slice(0, 45)}...</Link>
                      <div className={styles.rowCategory}>{p.category}</div>
                    </div>
                    <div className={styles.rowPrices}>
                      <span className={styles.rowDiscounted}>₹{p.discountedPrice.toLocaleString('en-IN')}</span>
                      <span className={styles.rowOriginal}>₹{p.originalPrice.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className={styles.summaryBox}>
                <div className={styles.totals}>
                  <span>Total Cost:</span>
                  <span className={styles.totalPrice}>₹{result.totalPrice.toLocaleString('en-IN')}</span>
                </div>
                <div className={styles.totalsOriginal}>
                  <span>Original MSRP:</span>
                  <span>₹{result.originalPrice.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <a 
                href="https://www.amazon.in/cart/add?tag=ftfxtechsolut-21" 
                target="_blank" 
                rel="noreferrer" 
                className={styles.buyAllBtn}
              >
                Add All To Amazon Cart
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
