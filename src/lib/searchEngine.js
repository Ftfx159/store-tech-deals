import Fuse from 'fuse.js';

export function performFuzzySearch(products, query) {
  if (!query || !query.trim()) {
    return products;
  }
  
  // Advanced fuzzy search configuration
  const fuse = new Fuse(products, {
    keys: [
      { name: 'name', weight: 0.7 },
      { name: 'brand', weight: 0.2 },
      { name: 'category', weight: 0.1 }
    ],
    threshold: 0.35, // 0.0 is perfect match, 1.0 is match anything. 0.35 provides typo tolerance but remains relevant.
    ignoreLocation: true, // Matches can be anywhere in the string
    useExtendedSearch: true,
  });

  const results = fuse.search(query);
  
  // Return just the matching product objects
  return results.map(result => result.item);
}
