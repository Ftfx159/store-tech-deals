"use client";
import { useState } from 'react';
import { useToast } from '@/context/ToastContext';
import styles from './PriceDropAlert.module.css';

export default function PriceDropAlert({ product }) {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const { addToast } = useToast();

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    
    setLoading(true);
    try {
      const res = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          productId: product.id, 
          currentPrice: product.discountedPrice 
        })
      });

      if (res.ok) {
        addToast('success', `Alert set! We will email ${email} when the price drops.`);
        setIsOpen(false);
        setEmail('');
      } else {
        addToast('error', 'Failed to create alert. Please try again.');
      }
    } catch (e) {
      addToast('error', 'Network error while creating alert.');
    }
    setLoading(false);
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)} className={styles.triggerBtn}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>
        Notify me when price drops
      </button>

      {isOpen && (
        <div className={styles.overlay} onClick={() => setIsOpen(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.header}>
              <h3>Set Price Alert</h3>
              <button className={styles.closeBtn} onClick={() => setIsOpen(false)}>×</button>
            </div>
            
            <p className={styles.desc}>
              Get an email as soon as the price of <strong>{product.name}</strong> drops below its current price.
            </p>
            
            <form onSubmit={handleSubmit} className={styles.form}>
              <input 
                type="email" 
                placeholder="Enter your email address" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                className={styles.input}
                required
              />
              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '16px' }} disabled={loading}>
                {loading ? 'Creating...' : 'Create Alert'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
