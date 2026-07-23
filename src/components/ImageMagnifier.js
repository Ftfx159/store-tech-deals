"use client";
import { useState } from 'react';
import Image from 'next/image';
import styles from './ImageMagnifier.module.css';

export default function ImageMagnifier({ src, alt }) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [showMagnifier, setShowMagnifier] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - left;
    const y = e.clientY - top;
    
    // Convert to percentages for the background position
    setPosition({
      x: (x / width) * 100,
      y: (y / height) * 100
    });
    
    // Pixel coordinates for the lens position
    setCursorPosition({ x, y });
  };

  return (
    <div 
      className={styles.container}
      onMouseEnter={() => setShowMagnifier(true)}
      onMouseLeave={() => setShowMagnifier(false)}
      onMouseMove={handleMouseMove}
    >
      <Image 
        src={src} 
        alt={alt}
        fill
        className={styles.mainImage}
        sizes="(max-width: 768px) 100vw, 50vw"
        priority
      />
      
      {showMagnifier && (
        <div 
          className={styles.magnifierLens}
          style={{
            top: `${cursorPosition.y - 100}px`,
            left: `${cursorPosition.x - 100}px`,
            backgroundImage: `url('${src}')`,
            backgroundPosition: `${position.x}% ${position.y}%`
          }}
        />
      )}
    </div>
  );
}
