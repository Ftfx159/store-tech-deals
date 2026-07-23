"use client";
import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./ProductCard.module.css";
import { getAffiliateUrl } from "@/lib/affiliate";
import { useStorage } from "@/context/StorageContext";
import BuyButton from "./BuyButton";

export default function ProductCard({ product }) {
  const [transform, setTransform] = useState("");
  const cardRef = useRef(null);
  const { toggleWishlist, isInWishlist } = useStorage();

  const isSaved = isInWishlist(product.id);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((y - centerY) / centerY) * -5; // max 5 deg
    const rotateY = ((x - centerX) / centerX) * 5;
    
    setTransform(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`);
  };

  const handleMouseLeave = () => {
    setTransform("");
  };

  const discountPercentage = Math.round(((product.originalPrice - product.discountedPrice) / product.originalPrice) * 100);
  const savings = product.originalPrice - product.discountedPrice;
  const affiliateUrl = getAffiliateUrl(product.amazonUrl);

  const formatPrice = (price) => {
    const numStr = new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 2
    }).format(price);
    return `₹${numStr}`;
  };

  return (
    <div 
      ref={cardRef}
      className={styles.card}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transform }}
    >
      {discountPercentage > 0 && (
        <div className={styles.discountBadge}>-{discountPercentage}%</div>
      )}

      <button 
        className={`${styles.wishlistToggle} ${isSaved ? styles.saved : ''}`}
        onClick={(e) => { e.preventDefault(); toggleWishlist(product); }}
        aria-label="Save to Wishlist"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
        </svg>
      </button>
      
      <Link href={`/product/${product.id}`} className={styles.imageContainer}>
        <Image 
          src={product.imageUrl} 
          alt={product.name}
          fill
          className={styles.image}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </Link>
      
      <div className={styles.content}>
        <div className={styles.tags}>
          <span className={styles.verifiedBadge}>✓ Verified</span>
          {product.primeEligible && <span className={styles.primeBadge}>prime</span>}
        </div>
        
        <div className={styles.titleWrapper}>
          <Link href={`/product/${product.id}`}>
            <h3 className={styles.title} title={product.name}>{product.name}</h3>
          </Link>
          <p className={styles.brand}>by {product.brand}</p>
        </div>
        
        <div className={styles.bottomSection}>
          <div className={styles.rating}>
            <span className={styles.stars}>{"★".repeat(Math.floor(product.rating))}</span>
            <span className={styles.ratingScore}>{product.rating}</span>
            <span className={styles.reviews}>({product.reviews.toLocaleString()} reviews)</span>
          </div>
          
          <div className={styles.pricing}>
            <div className={styles.currentPrice}>{formatPrice(product.discountedPrice)}</div>
            {savings > 0 && (
              <div className={styles.originalInfo}>
                <span className={styles.originalPrice}>M.R.P: {formatPrice(product.originalPrice)}</span>
                <span className={styles.savings}>Save {formatPrice(savings)}</span>
              </div>
            )}
          </div>
          
          {product.couponCode && (
            <div className={styles.couponBox}>
              <span className={styles.couponText}>Extra Savings</span>
              <span className={styles.couponCode}>{product.couponCode}</span>
            </div>
          )}
          
          <div className={styles.actions}>
            <BuyButton 
              amazonUrl={affiliateUrl} 
              couponCode={product.couponCode} 
              fullWidth={true} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}
