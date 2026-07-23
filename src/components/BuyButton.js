"use client";
import { useState } from 'react';
import styles from './BuyButton.module.css';
import { useToast } from '@/context/ToastContext';

export default function BuyButton({ amazonUrl, couponCode, fullWidth }) {
  const [clicked, setClicked] = useState(false);
  const { addToast } = useToast();

  const handleClick = (e) => {
    if (couponCode) {
      e.preventDefault();
      
      navigator.clipboard.writeText(couponCode).then(() => {
        setClicked(true);
        addToast(`Coupon ${couponCode} Copied! Redirecting...`);
        
        setTimeout(() => {
          window.open(amazonUrl, '_blank', 'noopener,noreferrer');
          setClicked(false);
        }, 1500);
      }).catch(() => {
        // Fallback if clipboard API is blocked
        window.open(amazonUrl, '_blank', 'noopener,noreferrer');
      });
    }
  };

  return (
    <a 
      href={amazonUrl}
      target="_blank" 
      rel="noopener noreferrer" 
      className={['btn', 'btn-amazon', styles.buyBtn, fullWidth ? styles.fullWidth : '', clicked ? styles.copiedState : ''].filter(Boolean).join(' ')}
      onClick={handleClick}
    >
      {clicked ? '✓ Code Copied! Redirecting...' : (couponCode ? 'Copy Code & Buy' : 'Buy on Amazon')}
    </a>
  );
}
