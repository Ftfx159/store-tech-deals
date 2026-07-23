"use client";
import React, { useState, useEffect } from 'react';
import styles from './FomoEngine.module.css';

const MOCK_NAMES = ["Rahul from Delhi", "Ananya from Mumbai", "Vikram from Bangalore", "Priya from Chennai", "Aarav from Pune", "Sneha from Hyderabad"];
const MOCK_ACTIONS = [
  "just locked in 45% off the Razer Mouse!",
  "just bought the ASUS ROG Zephyrus G14!",
  "claimed the secret deal on AirPods Pro!",
  "just saved ₹12,000 on a new 4K Monitor!",
  "just grabbed the last available Logitech MX Master 3!"
];

export default function FomoEngine() {
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const triggerFomo = () => {
      const randomName = MOCK_NAMES[Math.floor(Math.random() * MOCK_NAMES.length)];
      const randomAction = MOCK_ACTIONS[Math.floor(Math.random() * MOCK_ACTIONS.length)];
      
      setToast({ name: randomName, action: randomAction, id: Date.now() });

      // Auto-hide after 4 seconds
      setTimeout(() => {
        setToast(null);
      }, 4000);
    };

    // Initial delay so it doesn't pop up instantly on load
    const initialTimeout = setTimeout(triggerFomo, 5000);

    // Then random interval between 15s and 30s
    const interval = setInterval(() => {
      triggerFomo();
    }, Math.floor(Math.random() * 15000) + 15000);

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
        <strong>{toast.name}</strong> {toast.action}
      </div>
    </div>
  );
}
