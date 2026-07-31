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
  const [error, setError] = useState(null);

  const goals = [
    { id: 'gaming', name: 'Gaming Setup', icon: '🎮' },
    { id: 'productivity', name: 'Work / Productivity', icon: '💼' },
    { id: 'streaming', name: 'Streaming & Creator', icon: '🎥' },
  ];

  const handleBuild = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/build-setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ budget, goal })
      });
      
      const data = await res.json();
      
      if (!data.success) {
        setError(data.error || "Failed to build setup. Try a different budget.");
        setLoading(false);
        return;
      }
      
      setResult({
        goal: goals.find(g => g.id === goal).name,
        totalPrice: data.data.totalPrice,
        originalPrice: data.data.originalPrice,
        core: data.data.core,
        accessories: data.data.accessories
      });
    } catch (err) {
      setError("Network error occurred while building setup.");
    }
    
    setLoading(false);
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

        <div className={styles.resultCard}>
          {!result && !loading && !error && (
            <div className={styles.emptyState}>
              <div className={styles.robotIcon}>🤖</div>
              <p>Ready to build? Set your budget and click Generate.</p>
            </div>
          )}

          {error && !loading && (
            <div className={styles.errorState}>
              <p>⚠️ {error}</p>
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

              <div className={styles.sectionHeader}>
                <h3>Core PC Components</h3>
                <span className={styles.compatibilityBadge}>✓ 100% Compatible</span>
              </div>
              <div className={styles.productList}>
                {result.core.map(p => (
                  <div key={p.id} className={styles.productRow}>
                    <img src={p.imageUrl} alt={p.name} className={styles.rowImage} />
                    <div className={styles.rowInfo}>
                      <Link href={`/product/${p.id}`} className={styles.rowName}>{p.name.slice(0, 50)}...</Link>
                      <div className={styles.rowCategory}>{p.category}</div>
                    </div>
                    <div className={styles.rowPrices}>
                      <span className={styles.rowDiscounted}>₹{p.discountedPrice.toLocaleString('en-IN')}</span>
                      <span className={styles.rowOriginal}>₹{p.originalPrice.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                ))}
              </div>

              {result.accessories.length > 0 && (
                <>
                  <div className={styles.sectionHeader}>
                    <h3>Recommended Accessories</h3>
                  </div>
                  <div className={styles.productList}>
                    {result.accessories.map(p => (
                      <div key={p.id} className={styles.productRow}>
                        <img src={p.imageUrl} alt={p.name} className={styles.rowImage} />
                        <div className={styles.rowInfo}>
                          <Link href={`/product/${p.id}`} className={styles.rowName}>{p.name.slice(0, 50)}...</Link>
                          <div className={styles.rowCategory}>{p.category}</div>
                        </div>
                        <div className={styles.rowPrices}>
                          <span className={styles.rowDiscounted}>₹{p.discountedPrice.toLocaleString('en-IN')}</span>
                          <span className={styles.rowOriginal}>₹{p.originalPrice.toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

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
