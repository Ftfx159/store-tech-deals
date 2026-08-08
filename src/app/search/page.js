import { searchProducts, products } from "@/lib/products";
import ProductCard from "@/components/ProductCard";
import BackButton from "@/components/BackButton";
import SearchFilters from "@/components/SearchFilters";
export const dynamic = 'force-dynamic';
import styles from "./page.module.css";
import Link from "next/link";

export async function generateMetadata({ searchParams }) {
  const params = await searchParams;
  const query = params.q || "";
  
  const title = query ? `${query.charAt(0).toUpperCase() + query.slice(1)} Deals & Discounts | Orvessa` : "All Tech Deals & Discounts | Orvessa";
  const description = query ? `Find the best deals, coupons, and discounts for ${query} on Amazon India.` : "Browse all our top tech deals and electronics discounts.";
  
  return {
    title,
    description,
    alternates: {
      canonical: `https://orvessa.com/search${query ? `?q=${encodeURIComponent(query)}` : ''}`,
    },
    openGraph: {
      title,
      description,
      url: `https://orvessa.com/search`,
    }
  };
}

export default async function SearchPage({ searchParams }) {
  const params = await searchParams;
  const query = params.q || "";
  const sort = params.sort || "";
  const brand = params.brand || "";
  
  // Very basic search logic for the live API wrapper
  let results = [];
  if (query) {
    results = await searchProducts(query);
  } else {
    // Fallback to trending
    results = await searchProducts("popular electronics"); 
  }

  // Apply Brand Filter
  if (brand) {
    results = results.filter(p => p.brand.toLowerCase() === brand.toLowerCase());
  }

  // Apply Sorting
  if (sort === "discount") {
    results.sort((a, b) => {
      const aDiscount = (a.originalPrice - a.discountedPrice) / a.originalPrice;
      const bDiscount = (b.originalPrice - b.discountedPrice) / b.originalPrice;
      return bDiscount - aDiscount;
    });
  } else if (sort === "price_asc") {
    results.sort((a, b) => a.discountedPrice - b.discountedPrice);
  } else if (sort === "price_desc") {
    results.sort((a, b) => b.discountedPrice - a.discountedPrice);
  } else if (sort === "rating") {
    results.sort((a, b) => b.rating - a.rating);
  }

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://orvessa.com/"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": query ? `Search: ${query}` : "All Products",
        "item": `https://orvessa.com/search${query ? `?q=${encodeURIComponent(query)}` : ''}`
      }
    ]
  };

  return (
    <div className={`container ${styles.searchPage}`}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <div className={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <BackButton />
          <h1 className={styles.title}>
          {query ? (
            <>Search results for <span className="text-gradient">&quot;{query}&quot;</span></>
          ) : (
            "All Products"
          )}
        </h1>
        </div>
        <p className={styles.resultsCount}>{results.length} products found</p>
      </div>
      
      <div className={styles.layout}>
        {/* Sidebar Filters */}
        <aside className={styles.sidebar}>
          <SearchFilters />
        </aside>

        {/* Results Grid */}
        <div className={styles.results}>
          {results.length > 0 ? (
            <div className={styles.productGrid}>
              {results.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className={styles.noResults}>
              <h3>No products found</h3>
              <p>Try checking your spelling or use more general terms.</p>
              <Link href="/search" className="btn btn-primary" style={{ marginTop: '20px' }}>
                View All Products
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
