"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './HeroSlider.module.css';

export default function HeroSlider({ products }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (!products || products.length <= 1) return;
    
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex(prev => (prev + 1) % products.length);
        setIsAnimating(false);
      }, 600); // Wait for the luxury fade out
    }, 5000); // Change every 5 seconds for a slower, more premium pace
    
    return () => clearInterval(interval);
  }, [products]);

  if (!products || products.length === 0) return null;

  const currentProduct = products[currentIndex];
  
  // Prefer explicit coupon cashback if available, otherwise use standard Amazon savings
  const amazonSavings = currentProduct.originalPrice - currentProduct.discountedPrice;
  const bestSavings = currentProduct.cashbackAmount || amazonSavings;
  const savingsText = bestSavings > 0 ? `₹${bestSavings.toLocaleString()} OFF` : 'HOT DEAL';
  const codeText = currentProduct.couponCode ? `Code Applied: ${currentProduct.couponCode}` : 'Auto Applied at Checkout';

  return (
    <div className={styles.heroGraphic}>
      <div className={styles.graphicCircle}></div>
      
      <Link href={`/product/${currentProduct.id}`} className={`${styles.imageWrapper} ${isAnimating ? styles.fadeOut : styles.fadeIn}`}>
        <Image 
          src={currentProduct.imageUrl} 
          alt={currentProduct.name} 
          width={500} 
          height={500} 
          className={styles.heroMainImage}
          priority
        />
      </Link>

      <div className={`${styles.graphicCard} ${isAnimating ? styles.fadeOut : styles.fadeIn}`}>
        <span className={styles.percentBadge}>{savingsText}</span>
        <p>{codeText}</p>
      </div>
    </div>
  );
}
