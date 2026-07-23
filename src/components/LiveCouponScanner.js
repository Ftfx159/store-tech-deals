"use client";
import { useState } from 'react';
import styles from './LiveCouponScanner.module.css';
import { useRouter } from 'next/navigation';
import { useToast } from '@/context/ToastContext';

export default function LiveCouponScanner({ topCoupon }) {
  const [status, setStatus] = useState('idle'); // idle, scanning, found
  const [copied, setCopied] = useState(false);
  const router = useRouter();
  const { addToast } = useToast();

  const handleScan = () => {
    setStatus('scanning');
    
    // Simulate real-time API scanning
    setTimeout(() => {
      setStatus('found');
    }, 2500);
  };

  const handleApply = () => {
    if (topCoupon && topCoupon.couponCode) {
      navigator.clipboard.writeText(topCoupon.couponCode).then(() => {
        setCopied(true);
        addToast(`Coupon ${topCoupon.couponCode} Copied!`);
        setTimeout(() => {
          router.push('/search?q=lightning');
        }, 1500);
      });
    } else {
      router.push('/search?q=lightning');
    }
  };

  return (
    <>
      <button 
        className={`btn btn-primary ${styles.scanBtn} ${status === 'scanning' ? styles.scanning : ''}`}
        onClick={handleScan}
        disabled={status === 'scanning' || status === 'found'}
      >
        {status === 'idle' && (
          <>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            Scan for Live Coupons
          </>
        )}
        {status === 'scanning' && 'Scanning Amazon API...'}
        {status === 'found' && '✓ High-Value Code Found!'}
      </button>

      {status === 'found' && topCoupon && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.successIcon}>🎉</div>
            <h3>Exclusive Deal Unlocked!</h3>
            <p>We found a live code that saves you massive amounts on premium tech.</p>
            
            <div className={styles.couponCard}>
              <span className={styles.discount}>₹{topCoupon.cashbackAmount?.toLocaleString()} OFF</span>
              <p>Code: <strong>{topCoupon.couponCode}</strong></p>
            </div>
            
            <button className={`btn btn-amazon ${styles.applyBtn} ${copied ? styles.copied : ''}`} onClick={handleApply}>
              {copied ? '✓ Code Copied! Redirecting...' : 'Copy Code & View Deal'}
            </button>
            
            <button className={styles.closeBtn} onClick={() => setStatus('idle')}>Maybe Later</button>
          </div>
        </div>
      )}
    </>
  );
}
