import ProductCard from "@/components/ProductCard";
import CountdownTimer from "@/components/CountdownTimer";
import BackButton from "@/components/BackButton";
import { getFlashDeals } from "@/lib/products";
import styles from "../search/page.module.css";
import flashStyles from "./flash.module.css";

export const metadata = {
  title: "Flash Deals | FTFX Tech Deals",
};

export default async function FlashDealsPage() {
  const deals = await getFlashDeals();

  return (
    <div className={`container ${styles.searchPage}`}>
      <div className={flashStyles.header}>
        <div className={flashStyles.titleRow}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <BackButton />
            <h1 className={styles.title} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span className="pulse-icon" style={{ display: 'inline-flex', alignItems: 'center' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
            </span> Flash Deals
          </h1>
          </div>
          <CountdownTimer hours={24} />
        </div>
        <p className={styles.resultsCount}>
          Highly discounted electronics and computers. Minimum 30% OFF. Limited time only.
        </p>
      </div>

      {deals.length === 0 ? (
        <div className={styles.noResults}>
          <h3>No flash deals available right now.</h3>
          <p>Check back later for massive discounts on top tech!</p>
        </div>
      ) : (
        <div className={styles.productGrid}>
          {deals.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
