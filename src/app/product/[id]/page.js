import { getProductById, searchProducts } from "@/lib/products";
import { getAffiliateUrl } from "@/lib/affiliate";
import BuyButton from "@/components/BuyButton";
import PriceTracker from "@/components/PriceTracker";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import styles from "./page.module.css";
import ProductCard from "@/components/ProductCard";
import BackButton from "@/components/BackButton";
import RecentlyViewed from "@/components/RecentlyViewed";
import PriceDropAlert from "@/components/PriceDropAlert";
import ComparisonTable from "@/components/ComparisonTable";
import AIDealVerdict from "@/components/AIDealVerdict";
import ImageMagnifier from "@/components/ImageMagnifier";
import BundleAndSave from "@/components/BundleAndSave";
import ReviewSentiment from "@/components/ReviewSentiment";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) return { title: "Product Not Found" };
  
  const title = `${product.name.slice(0, 50)}... | FTFX Tech Deals`;
  const description = `Buy ${product.name} at a discount. Save ₹${product.originalPrice - product.discountedPrice}. Compare features and read reviews.`;

  return {
    title,
    description,
    alternates: {
      canonical: `https://ftfxtechdeals.com/product/${id}`,
    },
    openGraph: {
      title,
      description,
      url: `https://ftfxtechdeals.com/product/${id}`,
      images: [{ url: product.imageUrl }],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [product.imageUrl],
    },
  };
}

export default async function ProductPage({ params }) {
  const { id } = await params;
  const product = await getProductById(id);
  
  if (!product) {
    notFound();
  }

  const affiliateUrl = getAffiliateUrl(product.amazonUrl);
  const savings = product.originalPrice - product.discountedPrice;
  const discountPercentage = Math.round((savings / product.originalPrice) * 100);
  
  // We mock related products based on current category query for the live API
  const relatedProducts = await searchProducts(product.category);

  const formatPrice = (price) => {
    const numStr = new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 2
    }).format(price);
    return `₹${numStr}`;
  };

  const productSchema = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.name,
    "image": product.imageUrl,
    "description": product.name,
    "brand": {
      "@type": "Brand",
      "name": product.brand || "Generic"
    },
    "sku": product.id,
    "offers": {
      "@type": "Offer",
      "url": `https://ftfxtechdeals.com/product/${product.id}`,
      "priceCurrency": "INR",
      "price": product.discountedPrice,
      "priceValidUntil": new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      "itemCondition": "https://schema.org/NewCondition",
      "availability": product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
    },
    "aggregateRating": product.reviews > 0 ? {
      "@type": "AggregateRating",
      "ratingValue": product.rating || 4.5,
      "reviewCount": product.reviews
    } : undefined
  };

  return (
    <div className={`container ${styles.productPage}`}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <div className={styles.breadcrumbs} style={{ display: 'flex', alignItems: 'center' }}>
        <BackButton />
        <span style={{ margin: '0 8px', color: '#cbd5e1' }}>|</span>
        <Link href="/">Home</Link> <span style={{ margin: '0 8px' }}>&gt;</span> <Link href={`/search?q=${product.category.toLowerCase()}`}>{product.category}</Link> <span style={{ margin: '0 8px' }}>&gt;</span> <span>{product.name}</span>
      </div>

      <div className={styles.mainContent}>
        <div className={styles.imageGallery}>
          <div className={`glass-panel ${styles.mainImageContainer}`}>
            <ImageMagnifier src={product.imageUrl} alt={product.name} />
          </div>
        </div>

        <div className={styles.details}>
          <div className={styles.brandAndTags}>
            <span className={styles.brand}>{product.brand}</span>
            {product.primeEligible && <span className={styles.primeBadge}>prime</span>}
          </div>
          
          <h1 className={styles.title}>{product.name}</h1>
          
          <div className={styles.rating}>
            <span className={styles.stars}>{"★".repeat(Math.floor(product.rating))}</span>
            <span className={styles.ratingScore}>{product.rating}</span>
            <span className={styles.reviews}>({product.reviews.toLocaleString()} reviews on Amazon)</span>
          </div>

          <AIDealVerdict 
            discountPercentage={discountPercentage} 
            rating={product.rating} 
            reviews={product.reviews} 
          />
          
          <div className={styles.pricingBox}>
            <div className={styles.priceRow}>
              <span className={styles.discountBadge}>-{discountPercentage}%</span>
              <span className={styles.currentPrice}>{formatPrice(product.discountedPrice)}</span>
            </div>
            <div className={styles.mrpRow}>
              <span>M.R.P.:</span>
              <span className={styles.originalPrice}>{formatPrice(product.originalPrice)}</span>
            </div>
            <p className={styles.savingsText}>You Save: {formatPrice(savings)}</p>
            <p className={styles.taxesText}>Inclusive of all taxes</p>
          </div>

          {product.couponCode && (
            <div className={styles.couponBox}>
              <span className={styles.couponLabel}>Extra Savings</span>
              <span className={styles.couponCode}>{product.couponCode}</span>
            </div>
          )}

          <PriceTracker 
            currentPrice={product.discountedPrice} 
            originalPrice={product.originalPrice} 
          />

          <div className={styles.features}>
            <h3>Key Features</h3>
            <ul>
              {product.features.map((feature, idx) => (
                <li key={idx}>{feature}</li>
              ))}
            </ul>
          </div>

          <BundleAndSave mainProduct={product} relatedProducts={relatedProducts} />

          <div className={styles.actionBox}>
            <BuyButton 
              amazonUrl={affiliateUrl} 
              couponCode={product.couponCode} 
              fullWidth={true} 
            />
            <PriceDropAlert product={product} />
            <p className={styles.affiliateDisclaimer}>
              * Redirects securely to Amazon.in
            </p>
          </div>
        </div>
      </div>

      <ReviewSentiment product={product} />
      
      <ComparisonTable 
        mainProduct={product}
        relatedProducts={relatedProducts}
      />

      {relatedProducts.length > 0 && (
        <section className={styles.relatedSection}>
          <h2 className={styles.relatedTitle}>Similar Products in {product.category}</h2>
          <div className={styles.productGrid}>
            {relatedProducts.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      <RecentlyViewed currentProduct={product} />
    </div>
  );
}
