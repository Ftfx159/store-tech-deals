import styles from "./page.module.css";

export default function Loading() {
  return (
    <div className={`container ${styles.productPage}`}>
      <div className={styles.breadcrumbs} style={{ height: '24px', width: '30%', backgroundColor: '#f1f5f9', borderRadius: '4px', marginBottom: '20px' }}></div>

      <div className={styles.mainContent}>
        <div className={styles.imageGallery}>
          <div className={`glass-panel ${styles.mainImageContainer}`} style={{ backgroundColor: '#f8fafc', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
            </div>
          </div>
        </div>

        <div className={styles.details}>
          <div style={{ height: '20px', width: '20%', backgroundColor: '#f1f5f9', borderRadius: '4px', marginBottom: '12px' }}></div>
          
          <div style={{ height: '36px', width: '80%', backgroundColor: '#f1f5f9', borderRadius: '6px', marginBottom: '8px' }}></div>
          <div style={{ height: '36px', width: '60%', backgroundColor: '#f1f5f9', borderRadius: '6px', marginBottom: '20px' }}></div>
          
          <div style={{ height: '24px', width: '40%', backgroundColor: '#f1f5f9', borderRadius: '4px', marginBottom: '24px' }}></div>
          
          <div className={styles.pricingBox} style={{ minHeight: '140px', backgroundColor: '#f8fafc', borderColor: '#f1f5f9' }}>
             <div style={{ height: '32px', width: '40%', backgroundColor: '#e2e8f0', borderRadius: '6px', marginBottom: '12px' }}></div>
             <div style={{ height: '20px', width: '30%', backgroundColor: '#e2e8f0', borderRadius: '4px' }}></div>
          </div>

          <div style={{ height: '400px', width: '100%', backgroundColor: '#f8fafc', borderRadius: '16px', marginTop: '24px' }}></div>
        </div>
      </div>
    </div>
  );
}
