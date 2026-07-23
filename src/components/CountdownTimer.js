"use client";

import { useState, useEffect } from 'react';
import styles from './CountdownTimer.module.css';

export default function CountdownTimer({ hours = 24 }) {
  const [timeLeft, setTimeLeft] = useState({
    hours: hours,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    // Determine the end time (e.g. 24 hours from when they first load)
    // For a real flash sale, this would be an absolute UTC timestamp from the backend.
    const endTime = new Date().getTime() + (hours * 60 * 60 * 1000);

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = endTime - now;

      if (distance <= 0) {
        clearInterval(timer);
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
      } else {
        setTimeLeft({
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [hours]);

  const pad = (num) => num.toString().padStart(2, '0');

  return (
    <div className={styles.timerContainer}>
      <span className={styles.label}>Ends in:</span>
      <div className={styles.blocks}>
        <div className={styles.timeBlock}>
          <span className={styles.number}>{pad(timeLeft.hours)}</span>
          <span className={styles.text}>hrs</span>
        </div>
        <span className={styles.colon}>:</span>
        <div className={styles.timeBlock}>
          <span className={styles.number}>{pad(timeLeft.minutes)}</span>
          <span className={styles.text}>min</span>
        </div>
        <span className={styles.colon}>:</span>
        <div className={styles.timeBlock}>
          <span className={styles.number}>{pad(timeLeft.seconds)}</span>
          <span className={styles.text}>sec</span>
        </div>
      </div>
    </div>
  );
}
