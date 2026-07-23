"use client";
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import styles from './SearchFilters.module.css';

export default function SearchFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const currentQuery = searchParams.get('q') || '';
  const currentSort = searchParams.get('sort') || '';
  const currentBrand = searchParams.get('brand') || '';

  const [sort, setSort] = useState(currentSort);
  const [brand, setBrand] = useState(currentBrand);

  // Sync state if URL changes externally
  useEffect(() => {
    setSort(searchParams.get('sort') || '');
    setBrand(searchParams.get('brand') || '');
  }, [searchParams]);

  const updateFilters = (newSort, newBrand) => {
    const params = new URLSearchParams(searchParams);
    if (newSort) params.set('sort', newSort);
    else params.delete('sort');
    
    if (newBrand) params.set('brand', newBrand);
    else params.delete('brand');

    router.push(`/search?${params.toString()}`);
  };

  const handleSortChange = (e) => {
    const val = e.target.value;
    setSort(val);
    updateFilters(val, brand);
  };

  const handleBrandChange = (e) => {
    const val = e.target.checked ? e.target.value : '';
    setBrand(val);
    updateFilters(sort, val);
  };

  return (
    <div className={styles.filtersContainer}>
      <div className={styles.filterGroup}>
        <h3 className={styles.filterTitle}>Sort By</h3>
        <select value={sort} onChange={handleSortChange} className={styles.select}>
          <option value="">Relevance</option>
          <option value="discount">Highest Discount</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="rating">Highest Rated</option>
        </select>
      </div>

      <div className={styles.filterGroup}>
        <h3 className={styles.filterTitle}>Filter by Brand</h3>
        <div className={styles.checkboxGroup}>
          <label className={styles.checkboxLabel}>
            <input 
              type="checkbox" 
              value="apple" 
              checked={brand === 'apple'}
              onChange={handleBrandChange}
            />
            <span className={styles.checkmark}></span>
            Apple
          </label>
          <label className={styles.checkboxLabel}>
            <input 
              type="checkbox" 
              value="samsung" 
              checked={brand === 'samsung'}
              onChange={handleBrandChange}
            />
            <span className={styles.checkmark}></span>
            Samsung
          </label>
          <label className={styles.checkboxLabel}>
            <input 
              type="checkbox" 
              value="sony" 
              checked={brand === 'sony'}
              onChange={handleBrandChange}
            />
            <span className={styles.checkmark}></span>
            Sony
          </label>
          <label className={styles.checkboxLabel}>
            <input 
              type="checkbox" 
              value="asus" 
              checked={brand === 'asus'}
              onChange={handleBrandChange}
            />
            <span className={styles.checkmark}></span>
            Asus
          </label>
        </div>
      </div>
    </div>
  );
}
