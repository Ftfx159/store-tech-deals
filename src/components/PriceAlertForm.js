"use client";
import { useState } from "react";
import styles from "./PriceAlertForm.module.css";
import { useToast } from "@/context/ToastContext";

export default function PriceAlertForm({ productId, currentPrice }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      const res = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, productId, currentPrice })
      });
      
      if (res.ok) {
        addToast('success', 'Alert set! We will email you if the price drops by 5% or more.');
        setEmail("");
      } else {
        addToast('error', 'Failed to set alert. Please try again.');
      }
    } catch (err) {
      addToast('error', 'An error occurred.');
    }
    setLoading(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.icon}>🔔</span>
        <h4>Price Drop Alert</h4>
      </div>
      <p className={styles.description}>
        Get notified instantly when this drops below <strong>₹{(currentPrice * 0.95).toLocaleString('en-IN', {maximumFractionDigits:0})}</strong>
      </p>
      
      <form onSubmit={handleSubmit} className={styles.form}>
        <input 
          type="email" 
          placeholder="Enter your email address" 
          required 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={styles.input}
          disabled={loading}
        />
        <button type="submit" className={styles.button} disabled={loading}>
          {loading ? '...' : 'Notify Me'}
        </button>
      </form>
    </div>
  );
}
