"use client";
import React, { useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './ComparisonTable.module.css';

export default function ComparisonTable({ mainProduct, relatedProducts }) {
  const [tiltStyle, setTiltStyle] = useState({});
  const containerRef = useRef(null);

  const competitors = relatedProducts.slice(0, 3);
  if (competitors.length === 0) return null;

  const allProducts = [mainProduct, ...competitors];

  const formatPrice = (price) => {
    const numStr = new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 0
    }).format(price);
    return `₹${numStr}`;
  };

  // 3D Tilt Effect
  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Smooth 3D tilt
    const rotateX = ((y - centerY) / centerY) * -6; // max 6 deg
    const rotateY = ((x - centerX) / centerX) * 6;
    
    setTiltStyle({
      transform: `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.01, 1.01, 1.01)`,
      transition: 'transform 0.1s ease-out'
    });
  };

  const handleMouseLeave = () => {
    setTiltStyle({
      transform: `perspective(1200px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`,
      transition: 'transform 0.5s ease-out'
    });
  };

  // Compute AI Metrics
  const computeMetrics = (p) => {
    const discount = Math.round(((p.originalPrice - p.discountedPrice) / p.originalPrice) * 100) || 0;
    
    // Value score algorithm
    let rawScore = (p.rating * 1.5) + (discount / 10);
    const valueScore = Math.min(10, Math.max(1, rawScore)).toFixed(1);
    
    const pricePerStar = Math.round(p.discountedPrice / p.rating);
    
    let verdict = "Solid Pick";
    if (valueScore >= 8.5) verdict = "🏆 Best Value";
    else if (p.discountedPrice > 25000) verdict = "💎 Premium";
    else verdict = "💰 Budget Pick";

    return { discount, valueScore, pricePerStar, verdict };
  };

  return (
    <div className={styles.advancedWrapper}>
      <div className={styles.headerArea}>
        <h3 className={styles.heading}><span className={styles.pulseIcon}>🤖</span> AI Comparison Matrix</h3>
        <p className={styles.subtitle}>Deep analysis across top market competitors</p>
      </div>
      
      <div 
        className={styles.matrix3DContainer}
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div className={styles.matrixInner} style={tiltStyle}>
          <div className={styles.cssGridMatrix} style={{ gridTemplateColumns: `140px repeat(${allProducts.length}, 1fr)` }}>
            
            {/* Headers Row */}
            <div className={`${styles.gridCell} ${styles.featureLabel}`}></div>
            {allProducts.map((p, idx) => {
              const isMain = idx === 0;
              return (
                <div key={`header-${p.id}`} className={`${styles.gridCell} ${styles.headerCell} ${isMain ? styles.mainCol : ''}`}>
                  {isMain && <div className={styles.youAreViewingBadge}>Currently Viewing</div>}
                  <div className={styles.imageWrapper}>
                    <Image src={p.imageUrl} alt={p.name} fill className={styles.image} />
                  </div>
                  <Link href={`/product/${p.id}`} className={styles.titleLink}>
                    <span className={styles.productName} title={p.name}>{p.name}</span>
                  </Link>
                </div>
              );
            })}

            {/* AI Verdict Row */}
            <div className={`${styles.gridCell} ${styles.featureLabel}`}>AI Verdict</div>
            {allProducts.map((p, idx) => {
              const metrics = computeMetrics(p);
              return (
                <div key={`verdict-${p.id}`} className={`${styles.gridCell} ${idx === 0 ? styles.mainCol : ''}`}>
                  <span className={styles.verdictBadge}>{metrics.verdict}</span>
                </div>
              );
            })}

            {/* Value Score Row */}
            <div className={`${styles.gridCell} ${styles.featureLabel}`}>Value Score</div>
            {allProducts.map((p, idx) => {
              const metrics = computeMetrics(p);
              const isHigh = metrics.valueScore >= 8.0;
              return (
                <div key={`score-${p.id}`} className={`${styles.gridCell} ${idx === 0 ? styles.mainCol : ''}`}>
                  <div className={styles.scoreRing} style={{ borderColor: isHigh ? 'var(--accent-success)' : 'var(--accent-warning)' }}>
                    <span style={{ color: isHigh ? 'var(--accent-success)' : 'var(--accent-warning)' }}>{metrics.valueScore}</span>
                    <small>/10</small>
                  </div>
                </div>
              );
            })}

            {/* Price Row */}
            <div className={`${styles.gridCell} ${styles.featureLabel}`}>Price</div>
            {allProducts.map((p, idx) => (
              <div key={`price-${p.id}`} className={`${styles.gridCell} ${idx === 0 ? styles.mainCol : ''}`}>
                <div className={styles.priceData}>
                  <span className={styles.currentPrice}>{formatPrice(p.discountedPrice)}</span>
                  {p.originalPrice > p.discountedPrice && (
                    <span className={styles.originalPrice}>{formatPrice(p.originalPrice)}</span>
                  )}
                </div>
              </div>
            ))}

            {/* Discount Depth Row */}
            <div className={`${styles.gridCell} ${styles.featureLabel}`}>Discount Depth</div>
            {allProducts.map((p, idx) => {
              const { discount } = computeMetrics(p);
              return (
                <div key={`discount-${p.id}`} className={`${styles.gridCell} ${idx === 0 ? styles.mainCol : ''}`}>
                  <div className={styles.discountBarBg}>
                    <div className={styles.discountBarFill} style={{ width: `${Math.min(100, discount * 2)}%` }}></div>
                  </div>
                  <span className={styles.discountText}>{discount}% OFF</span>
                </div>
              );
            })}

            {/* Price Per Star Row */}
            <div className={`${styles.gridCell} ${styles.featureLabel}`}>Price per Star</div>
            {allProducts.map((p, idx) => {
              const { pricePerStar } = computeMetrics(p);
              return (
                <div key={`pps-${p.id}`} className={`${styles.gridCell} ${idx === 0 ? styles.mainCol : ''}`}>
                  <span className={styles.pricePerStar}>{formatPrice(pricePerStar)} / ★</span>
                </div>
              );
            })}
            
            {/* Standard Rating Row */}
            <div className={`${styles.gridCell} ${styles.featureLabel}`}>Amazon Rating</div>
            {allProducts.map((p, idx) => (
              <div key={`rating-${p.id}`} className={`${styles.gridCell} ${idx === 0 ? styles.mainCol : ''}`}>
                <div className={styles.ratingBox}>
                  <span className={styles.stars}>{"★".repeat(Math.floor(p.rating))}</span>
                  <span className={styles.score}>{p.rating}</span>
                </div>
              </div>
            ))}

            {/* Action Row */}
            <div className={`${styles.gridCell} ${styles.featureLabel}`}>Action</div>
            {allProducts.map((p, idx) => (
              <div key={`action-${p.id}`} className={`${styles.gridCell} ${idx === 0 ? styles.mainCol : ''}`}>
                 <Link href={`/product/${p.id}`} className="btn btn-primary" style={{ padding: '10px 16px', fontSize: '0.85rem', width: '100%', textAlign: 'center', fontWeight: 'bold' }}>
                    View Deal
                  </Link>
              </div>
            ))}

          </div>
        </div>
      </div>
    </div>
  );
}
