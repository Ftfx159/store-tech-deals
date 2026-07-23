"use client";
import { useInView } from '../hooks/useInView';

export default function RevealSection({ children, className = "" }) {
  const [ref, isVisible] = useInView({ threshold: 0.1 });

  return (
    <div ref={ref} className={`reveal ${isVisible ? 'visible' : ''} ${className}`}>
      {children}
    </div>
  );
}
