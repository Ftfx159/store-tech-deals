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

  const handleReset = () => {
    setResult(null);
    setBudget(80000);
  };

  const handleImageError = (e, productName) => {
    e.target.onerror = null; 
    const cleanName = productName ? productName.replace(/[^a-zA-Z0-9 ]/g, '').slice(0, 80) : 'tech gadget';
    e.target.src = `https://image.pollinations.ai/prompt/${encodeURIComponent(cleanName + ' premium tech product photography studio lighting')}?width=400&height=400&nologo=true`;
  };

  const handleBuyEntireSetup = () => {
    if (!result) return;
    const allItems = [...result.core, ...result.accessories];
    let cartUrl = `https://www.amazon.in/gp/aws/cart/add.html?AssociateTag=ftfx-21`;
    allItems.forEach((item, index) => {
      cartUrl += `&ASIN.${index + 1}=${item.id}&Quantity.${index + 1}=1`;
    });
    window.open(cartUrl, '_blank', 'noopener,noreferrer');
  };

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

  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Orvessa Smart Ecosystem Builder",
    "operatingSystem": "Web",
    "applicationCategory": "UtilitiesApplication",
    "description": "AI-powered tool that instantly builds your dream gaming or productivity setup based on your budget, finding the best compatible deals.",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "INR"
    }
  };

  return (
    <div className={`container ${styles.builderContainer}`}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
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
                    <img 
                      src={p.imageUrl} 
                      alt={p.name}
                      width="64"
                      height="64"
                      loading="lazy"
                      decoding="async" 
                      className={styles.rowImage} 
                      onError={(e) => handleImageError(e, p.name)} 
                    />
                    <div className={styles.rowInfo}>
                      <Link href={`/product/${p.id}`} className={styles.rowName}>{p.name.slice(0, 50)}...</Link>
                      <div className={styles.rowCategory}>{p.category}</div>
                    </div>
                    <div className={styles.rowActions}>
                      <div className={styles.rowPrices}>
                        <span className={styles.rowDiscounted}>₹{p.discountedPrice.toLocaleString('en-IN')}</span>
                        <span className={styles.rowOriginal}>₹{p.originalPrice.toLocaleString('en-IN')}</span>
                      </div>
                      <a 
                        href={`https://www.amazon.in/gp/aws/cart/add.html?AssociateTag=ftfx-21&ASIN.1=${p.id}&Quantity.1=1`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className={styles.rowCartBtn}
                      >
                        🛒 Add
                      </a>
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
                        <img 
                          src={p.imageUrl} 
                          alt={p.name} 
                          width="64"
                          height="64"
                          loading="lazy"
                          decoding="async"
                          className={styles.rowImage} 
                          onError={(e) => handleImageError(e, p.name)} 
                        />
                        <div className={styles.rowInfo}>
                          <Link href={`/product/${p.id}`} className={styles.rowName}>{p.name.slice(0, 50)}...</Link>
                          <div className={styles.rowCategory}>{p.category}</div>
                        </div>
                        <div className={styles.rowActions}>
                          <div className={styles.rowPrices}>
                            <span className={styles.rowDiscounted}>₹{p.discountedPrice.toLocaleString('en-IN')}</span>
                            <span className={styles.rowOriginal}>₹{p.originalPrice.toLocaleString('en-IN')}</span>
                          </div>
                          <a 
                            href={`https://www.amazon.in/gp/aws/cart/add.html?AssociateTag=ftfx-21&ASIN.1=${p.id}&Quantity.1=1`} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className={styles.rowCartBtn}
                          >
                            🛒 Add
                          </a>
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

              <div className={styles.buyAllSection}>
                <div className={styles.buyAllContent}>
                  <div className={styles.buyAllText}>
                    <h3>Ready to checkout?</h3>
                    <p>Instantly add all {result.core.length + result.accessories.length} components to your Amazon Cart.</p>
                  </div>
                  <button onClick={handleBuyEntireSetup} className={styles.buyAllBtn}>
                    🛒 Buy Entire Setup on Amazon
                  </button>
                </div>
              </div>

              <button className={styles.resetBtn} onClick={handleReset} style={{marginTop: '1.5rem'}}>
                &larr; Build Another Setup
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
