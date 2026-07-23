"use client";
import { useStorage } from '@/context/StorageContext';
import styles from './WishlistDrawer.module.css';
import Image from 'next/image';
import Link from 'next/link';

export default function WishlistDrawer({ isOpen, onClose }) {
  const { wishlist, toggleWishlist, isLoaded } = useStorage();

  if (!isLoaded) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className={`${styles.overlay} ${isOpen ? styles.overlayOpen : ''}`}
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className={`${styles.drawer} ${isOpen ? styles.drawerOpen : ''}`}>
        <div className={styles.header}>
          <h2>Saved Deals ({wishlist.length})</h2>
          <button onClick={onClose} className={styles.closeBtn}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <div className={styles.content}>
          {wishlist.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>💔</div>
              <p>No saved deals yet.</p>
              <button onClick={onClose} className="btn btn-primary">Continue Shopping</button>
            </div>
          ) : (
            <div className={styles.list}>
              {wishlist.map((item) => (
                <div key={item.id} className={styles.wishlistItem}>
                  <Link href={`/product/${item.id}`} onClick={onClose} className={styles.imageLink}>
                    <div className={styles.imageWrapper}>
                      <Image src={item.imageUrl} alt={item.name} fill className={styles.image} />
                    </div>
                  </Link>
                  <div className={styles.details}>
                    <Link href={`/product/${item.id}`} onClick={onClose}>
                      <h4 className={styles.title}>{item.name}</h4>
                    </Link>
                    <div className={styles.priceRow}>
                      <span className={styles.price}>
                        {`₹${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(item.discountedPrice)}`}
                      </span>
                    </div>
                  </div>
                  <button onClick={() => toggleWishlist(item)} className={styles.removeBtn} title="Remove">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
