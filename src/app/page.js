export const dynamic = 'force-dynamic';
import styles from "./page.module.css";
import ProductSlider from "@/components/ProductSlider";
import SecretDealVault from "@/components/SecretDealVault";
import HeroSlider from "@/components/HeroSlider";
import RevealSection from "@/components/RevealSection";
import LiveCouponScanner from "@/components/LiveCouponScanner";
import { getProductsByTag } from "@/lib/products";
import Link from "next/link";

export default async function Home() {
  const lightningDeals = await getProductsByTag("Lightning Deals");
  const trendingProducts = await getProductsByTag("Trending Products");
  const under1000 = await getProductsByTag("Under ₹1000");
  
  // Calculate live coupon stats from the fetched real data
  const allProducts = [...lightningDeals, ...trendingProducts, ...under1000];
  const productsWithCoupons = allProducts.filter(p => p.couponCode);
  const totalCodes = productsWithCoupons.length > 0 ? productsWithCoupons.length : 3; // Fallback to 3 if none found
  
  const maxSavings = allProducts.reduce((max, p) => {
    const savings = p.originalPrice - p.discountedPrice;
    return savings > max ? savings : max;
  }, 500); // Fallback minimum 500
  
  const topCouponProduct = productsWithCoupons.length > 0 ? productsWithCoupons[0] : null;
  const topCoupon = topCouponProduct ? { 
    couponCode: topCouponProduct.couponCode, 
    cashbackAmount: topCouponProduct.originalPrice - topCouponProduct.discountedPrice 
  } : { couponCode: 'AUTOAPPLIED', cashbackAmount: maxSavings };
  
  return (
    <div className={styles.main}>


      {/* Recommended for You */}
      <RevealSection className={styles.hero}>
        <div className={`container ${styles.heroContainer}`}>
          <div className={styles.heroContent}>
            <span className={styles.heroBadge}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="pulse-icon"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
              Automatic Coupons Applied
            </span>
            <h1 className={styles.heroTitle}>
              Shop Smarter.<br/>
              <span className="text-gradient">Never Overpay Again.</span>
            </h1>
            <p className={styles.heroSubtitle}>
              FTFX Tech Deals finds the best Amazon India tech discounts and automatically reveals exclusive coupon codes for maximum savings.
            </p>
            <div className={styles.heroActions}>
              <Link href="/search?q=coupons" className="btn btn-primary">
                View Active Coupons
              </Link>
              <Link href="/search?q=laptops" className={`btn ${styles.btnOutline}`}>
                Browse Laptops
              </Link>
            </div>
          </div>
          <div className={styles.heroImageContainer}>
            <HeroSlider products={lightningDeals.slice(0, 5)} />
          </div>
        </div>
      </RevealSection>

      {/* Featured Categories */}
      <RevealSection className={styles.categories}>
        <div className="container">
          <div className={styles.categoryGrid}>
            {[
              { 
                name: 'Laptops', 
                icon: <svg className="float-icon" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="2" y1="20" x2="22" y2="20"></line></svg>
              },
              { 
                name: 'Headphones', 
                icon: <svg className="float-icon" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 18v-6a9 9 0 0 1 18 0v6"></path><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path></svg>
              },
              { 
                name: 'Monitors', 
                icon: <svg className="float-icon" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
              },
              { 
                name: 'Accessories', 
                icon: <svg className="float-icon" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="6" y="2" width="12" height="20" rx="4" ry="4"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>
              }
            ].map(cat => (
              <Link key={cat.name} href={`/search?q=${cat.name.toLowerCase()}`} className={styles.categoryCard}>
                <div className={styles.iconWrapper}>{cat.icon}</div>
                <h3>{cat.name}</h3>
                <span>View Deals &rarr;</span>
              </Link>
            ))}
          </div>
        </div>
      </RevealSection>

      {/* Extension Promo Section (MOVED ABOVE LIGHTNING DEALS) */}
      <RevealSection className={styles.extensionPromo}>
        <div className={`container ${styles.promoContainer}`}>
          <div className={styles.promoContent}>
            <h2>Stop searching for coupon codes.</h2>
            <p>
              Let our completely free platform do the hard work. We aggregate all active Amazon India tech coupons and lightning deals so you can apply them instantly. Join thousands of smart shoppers.
            </p>
            <LiveCouponScanner topCoupon={topCoupon} />
          </div>
          <div className={styles.promoVisual}>
            <div className={styles.mockBrowser}>
              <div className={styles.mockBrowserHeader}>
                <div className={styles.mockDot}></div>
                <div className={styles.mockDot}></div>
                <div className={styles.mockDot}></div>
              </div>
              <div className={styles.mockExtensionPopup}>
                <h4>🎉 {totalCodes.toLocaleString()} Codes Found!</h4>
                <p>We found codes that can save you up to ₹{maxSavings.toLocaleString()} on this order.</p>
                <div className="btn btn-amazon" style={{width: '100%', fontSize: '0.9rem', padding: '12px', textAlign: 'center', display: 'block'}}>
                  Coupons Active
                </div>
              </div>
            </div>
          </div>
        </div>
      </RevealSection>

      {/* Lightning Deals */}
      <RevealSection className={`container ${styles.section}`}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            <span className={`${styles.icon} pulse-icon`}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
            </span> Lightning Deals
          </h2>
          <Link href="/search?q=lightning" className={styles.viewAll}>
            View All &rarr;
          </Link>
        </div>
        <ProductSlider products={lightningDeals} />
      </RevealSection>

      {/* Trending Tech */}
      <RevealSection className={`container ${styles.section}`}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            <span className={`${styles.icon} spin-slow-icon`}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
            </span> Premium Trending Tech
          </h2>
          <Link href="/search?q=trending" className={styles.viewAll}>
            View All &rarr;
          </Link>
        </div>
        <ProductSlider products={trendingProducts} />
      </RevealSection>
      
      {/* Budget Tech */}
      <RevealSection className={`container ${styles.section}`}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            <span className={`${styles.icon} float-icon`}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.54 15H17a2 2 0 0 0-2 2v4.54"/><path d="M7 3.34V5a3 3 0 0 0 3 3v0a2 2 0 0 1 2 2v0c0 1.1.9 2 2 2v0a2 2 0 0 0 2-2v0c0-1.1.9-2 2-2h1.66"/><path d="M11 21.95V18a2 2 0 0 0-2-2a2 2 0 0 1-2-2v-1a2 2 0 0 0-2-2H2.05"/><circle cx="12" cy="12" r="10"/></svg>
            </span> Budget Tech Finds
          </h2>
          <Link href="/search?q=under1000" className={styles.viewAll}>
            View All &rarr;
          </Link>
        </div>
        <ProductSlider products={under1000} />
      </RevealSection>

      {/* FAQ Section */}
      <RevealSection className={`container ${styles.section}`}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            <span className={`${styles.icon} float-icon`}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            </span> Frequently Asked Questions
          </h2>
        </div>
        <div className={styles.faqContainer}>
          <div className={styles.faqItem}>
            <h3>How do you find these deals?</h3>
            <p>Our custom AI engine actively scans Amazon India 24/7 for massive price drops, hidden lightning deals, and unadvertised coupons, bringing them straight to our dashboard before they expire.</p>
          </div>
          <div className={styles.faqItem}>
            <h3>Are the prices accurate?</h3>
            <p>Yes. Prices are updated constantly. However, Lightning Deals and coupons are extremely time-sensitive and can expire or sell out at any moment. If you see a good deal, claim it quickly.</p>
          </div>
          <div className={styles.faqItem}>
            <h3>How do the automatic coupons work?</h3>
            <p>When you click on a product through our site, our affiliate links automatically apply any available Amazon promotional codes or cashback offers directly to your cart at checkout.</p>
          </div>
          <div className={styles.faqItem}>
            <h3>Do I pay extra for using this site?</h3>
            <p>Absolutely not! The service is 100% free. We may earn a small affiliate commission from Amazon at zero additional cost to you, which helps keep this platform running.</p>
          </div>
        </div>
      </RevealSection>

      {/* Secret Gamified Deal Vault */}
      <section className="container" style={{ padding: '40px 20px' }}>
        <SecretDealVault />
      </section>

    </div>
  );
}
