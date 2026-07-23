"use client";
import Image from 'next/image';
import styles from './BundleAndSave.module.css';

export default function BundleAndSave({ mainProduct, relatedProducts }) {
  const accessories = relatedProducts.slice(0, 2);
  
  if (accessories.length === 0) return null;

  const bundle = [mainProduct, ...accessories];
  const totalPrice = bundle.reduce((sum, p) => sum + p.discountedPrice, 0);

  const formatPrice = (price) => {
    const numStr = new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 0
    }).format(price);
    return `₹${numStr}`;
  };

  return (
    <div className={styles.bundleContainer}>
      <h3 className={styles.title}>Frequently Bought Together</h3>
      
      <div className={styles.productsRow}>
        {bundle.map((p, idx) => (
          <div key={p.id} className={styles.productItem}>
            <div className={styles.imageWrapper}>
              <Image src={p.imageUrl} alt={p.name} fill className={styles.image} />
            </div>
            {idx < bundle.length - 1 && (
              <div className={styles.plusSign}>+</div>
            )}
          </div>
        ))}
      </div>

      <div className={styles.detailsRow}>
        <ul className={styles.list}>
          {bundle.map((p, idx) => (
            <li key={p.id} className={styles.listItem}>
              <span className={styles.bullet}>
                {idx === 0 ? (
                  <strong style={{ color: 'var(--text-primary)' }}>This item:</strong>
                ) : (
                  <span></span>
                )}
              </span>
              <span className={styles.productName} title={p.name}>{p.name}</span>
              <span className={styles.price}>{formatPrice(p.discountedPrice)}</span>
            </li>
          ))}
        </ul>

        <div className={styles.checkoutBox}>
          <div className={styles.totalLabel}>Total Price:</div>
          <div className={styles.totalPrice}>{formatPrice(totalPrice)}</div>
          <button 
            className="btn btn-primary" 
            style={{ width: '100%' }}
            onClick={() => {
              bundle.forEach(p => {
                if(p.amazonUrl) window.open(p.amazonUrl, '_blank');
              });
            }}
          >
            Add all 3 to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
