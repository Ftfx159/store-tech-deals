"use client";
import { useStorage } from "@/context/StorageContext";
import styles from "./Compare.module.css";
import Image from "next/image";
import Link from "next/link";
import BuyButton from "@/components/BuyButton";

export default function ComparePage() {
  const { compareList, toggleCompare, isLoaded } = useStorage();

  if (!isLoaded) return null;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Product Comparison ⚖️</h1>
        <p className={styles.subtitle}>Compare specs, features, and prices side-by-side.</p>
        {compareList.length === 0 && (
          <div className={styles.emptyState}>
            <p>You haven't added any products to compare yet!</p>
            <Link href="/" className="btn btn-primary">Browse Deals</Link>
          </div>
        )}
      </div>

      {compareList.length > 0 && (
        <div className={styles.compareGrid}>
          {compareList.map((product) => (
            <div key={product.id} className={styles.compareCard}>
              <button 
                className={styles.removeBtn} 
                onClick={() => toggleCompare(product)}
                aria-label="Remove from compare"
              >
                &times;
              </button>

              <div className={styles.imageWrapper}>
                <Image 
                  src={product.imageUrl} 
                  alt={product.name}
                  fill
                  className={styles.image}
                  style={{objectFit: 'contain'}}
                />
              </div>

              <div className={styles.infoSection}>
                <h3 className={styles.productTitle}>{product.name}</h3>
                <p className={styles.brand}>by {product.brand}</p>
                
                <div className={styles.priceRow}>
                  <span className={styles.currentPrice}>₹{product.discountedPrice?.toLocaleString('en-IN')}</span>
                  {product.originalPrice > product.discountedPrice && (
                    <span className={styles.savings}>
                      Save ₹{(product.originalPrice - product.discountedPrice).toLocaleString('en-IN')}
                    </span>
                  )}
                </div>

                <div className={styles.ratingRow}>
                  <span className={styles.stars}>{"★".repeat(Math.max(0, Math.floor(product.rating || 0)))}</span>
                  <span>{product.rating} ({product.reviews?.toLocaleString()})</span>
                </div>
              </div>

              <div className={styles.featuresSection}>
                <h4>Key Features</h4>
                <ul className={styles.featureList}>
                  {(product.features || []).slice(0, 5).map((feature, i) => (
                    <li key={i}>{feature}</li>
                  ))}
                </ul>
              </div>

              <div className={styles.actionSection}>
                <BuyButton amazonUrl={product.amazonUrl} couponCode={product.couponCode} fullWidth />
              </div>
            </div>
          ))}

          {/* Empty slot placeholder */}
          {compareList.length < 3 && Array.from({ length: 3 - compareList.length }).map((_, i) => (
             <div key={`empty-${i}`} className={styles.emptySlot}>
               <div className={styles.emptyIcon}>+</div>
               <p>Add another product</p>
             </div>
          ))}
        </div>
      )}
    </div>
  );
}
