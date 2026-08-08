"use client";
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import styles from './Header.module.css'; // Reuse existing styles

export default function SearchBar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter();
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced API call for autocomplete
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/autocomplete?q=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();
        setSuggestions(data.results || []);
        setShowDropdown(true);
      } catch (err) {
        console.error("Autocomplete fetch error", err);
      } finally {
        setIsSearching(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowDropdown(false);
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion.name);
    setShowDropdown(false);
    // Directly go to product page or search results
    router.push(`/product/${suggestion.id}`);
  };

  return (
    <div className={styles.searchContainer} ref={dropdownRef}>
      <form onSubmit={handleSearch} className={styles.searchBar}>
        <input
          type="search"
          aria-label="Search for products"
          placeholder="Search for laptops, monitors, accessories..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => {
            if (suggestions.length > 0) setShowDropdown(true);
          }}
          className={styles.searchInput}
        />
        <button type="submit" className={styles.searchBtn} aria-label="Submit Search">
          {isSearching ? (
            <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.spinIcon}>
              <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
            </svg>
          ) : (
            <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
          )}
        </button>
      </form>

      {/* Autocomplete Dropdown */}
      {showDropdown && suggestions.length > 0 && (
        <div className={styles.autocompleteDropdown}>
          {suggestions.map((item) => (
            <div 
              key={item.id} 
              className={styles.suggestionItem}
              onClick={() => handleSuggestionClick(item)}
            >
              <div className={styles.suggestionImageWrapper}>
                <Image 
                  src={item.imageUrl || '/icon.png'} 
                  alt={item.name} 
                  fill 
                  style={{ objectFit: 'contain' }} 
                  unoptimized 
                />
              </div>
              <div className={styles.suggestionText}>
                <div className={styles.suggestionTitle}>{item.name}</div>
                {item.discountedPrice && (
                  <div className={styles.suggestionPrice}>₹{item.discountedPrice.toLocaleString()}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
