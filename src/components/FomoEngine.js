"use client";
import React, { useState, useEffect } from 'react';
import styles from './FomoEngine.module.css';
import Link from 'next/link';

const MOCK_NAMES = ["Rahul from Delhi", "Ananya from Mumbai", "Vikram from Bangalore", "Priya from Chennai", "Aarav from Pune", "Sneha from Hyderabad", "Karan from Noida", "Neha from Gurgaon"];
const ACTIONS = ["just bought", "just locked in a deal on", "saved big on"];

export default function FomoEngine() {
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const triggerFomo = async () => {
      try {
        // Fetch a real trending product from our database
        const res = await fetch('/api/trending');
        const data = await res.json();
        
        if (!data.success || !data.product) return;

        const randomName = MOCK_NAMES[Math.floor(Math.random() * MOCK_NAMES.length)];
        const randomAction = ACTIONS[Math.floor(Math.random() * ACTIONS.length)];
        
        setToast({ 
          id: Date.now(),
          name: randomName, 
          action: randomAction,
          productName: data.product.name.slice(0, 40) + '...',
          savings: data.product.savings,
          productId: data.product.id
        });

        // Auto-hide after 5 seconds
        setTimeout(() => {
          setToast(null);
        }, 5000);
      } catch (err) {
        console.error("FOMO fetch error:", err);
      }
    };

    // Initial delay so it doesn't pop up instantly on load
    const initialTimeout = setTimeout(triggerFomo, 8000);

    // Then random interval between 20s and 40s
    const interval = setInterval(() => {
      triggerFomo();
    }, Math.floor(Math.random() * 20000) + 20000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, []);

  if (!toast) return null;

  return (
    <div className={styles.fomoToast} key={toast.id}>
      <div className={styles.fomoIcon}>⚡</div>
      <div className={styles.fomoContent}>
        <p className={styles.fomoText}>
          <strong>{toast.name}</strong> {toast.action} the 
          <Link href={`/product/${toast.productId}`} className={styles.fomoProductLink}> {toast.productName}</Link>
        </p>
        <p className={styles.fomoSavings}>Saved ₹{toast.savings.toLocaleString('en-IN')}!</p>
      </div>
    </div>
  );
}
