import Link from "next/link";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.footerContainer}`}>
        <div className={styles.brandSection}>
          <Link href="/" className={styles.logo}>
            <span className="text-gradient">Orvessa</span>
          </Link>
          <p className={styles.tagline}>Smart Tech. Bigger Savings.</p>
          <p className={styles.description}>
            Discover the best daily deals, lightning offers, coupons, and price drops on genuine electronic products from Amazon India.
          </p>
        </div>
        
        <div className={styles.linksSection}>
          <h3>Quick Links</h3>
          <ul>
            <li><Link href="/search?q=laptops">Laptops</Link></li>
            <li><Link href="/search?q=accessories">Accessories</Link></li>
            <li><Link href="/search?q=audio">Audio & Headphones</Link></li>
            <li><Link href="/search?q=smart">Smart Home</Link></li>
          </ul>
        </div>
        
        <div className={styles.disclosureSection}>
          <h3>Affiliate Disclosure</h3>
          <p>
            Orvessa is a participant in the Amazon Associates Program, an affiliate advertising program designed to provide a means for sites to earn advertising fees by advertising and linking to Amazon.in.
            Every purchase you make through our links helps support the site at no additional cost to you.
          </p>
        </div>
      </div>
      <div className={styles.bottomBar}>
        <div className="container">
          <p>&copy; {new Date().getFullYear()} Orvessa. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
