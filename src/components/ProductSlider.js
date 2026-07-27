"use client";

import { useRef, useState, useEffect } from "react";
import styles from "./ProductSlider.module.css";
import ProductCard from "./ProductCard";

export default function ProductSlider({ products }) {
  const sliderRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (sliderRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [products]);

  const scroll = (direction) => {
    if (sliderRef.current) {
      const scrollAmount = direction === "left" ? -400 : 400;
      sliderRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
      setTimeout(checkScroll, 350); // check after animation
    }
  };

  if (!products || products.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>Currently fetching live data from Amazon... Please ensure your API credentials are configured.</p>
      </div>
    );
  }

  return (
    <div className={styles.sliderContainer}>
      {canScrollLeft && (
        <button 
          className={`${styles.navBtn} ${styles.leftBtn}`} 
          onClick={() => scroll("left")}
          aria-label="Scroll left"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
        </button>
      )}
      
      <div 
        className={styles.slider} 
        ref={sliderRef} 
        onScroll={checkScroll}
      >
        {Array.from(new Map(products.map(p => [p.id, p])).values()).map((product) => (
          <div key={product.id} className={styles.slideItem}>
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      {canScrollRight && (
        <button 
          className={`${styles.navBtn} ${styles.rightBtn}`} 
          onClick={() => scroll("right")}
          aria-label="Scroll right"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </button>
      )}
    </div>
  );
}
