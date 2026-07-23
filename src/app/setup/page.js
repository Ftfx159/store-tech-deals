"use client";
import React, { useState, useMemo, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './page.module.css';
import BackButton from '@/components/BackButton';
import { PC_PARTS } from '@/lib/pcParts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const formatPrice = (price) => {
  return `₹${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(price)}`;
};

export default function SetupConfigurator() {
  const [selections, setSelections] = useState({
    cpu: null,
    motherboard: null,
    ram: null,
    gpu: null,
    psu: null,
    storage: null
  });

  const [expandedCategory, setExpandedCategory] = useState(Object.keys(PC_PARTS)[0]);

  const pdfRef = useRef(null);

  const handleSelect = (category, item, e) => {
    // Prevent the click from bubbling if they clicked the button directly
    if (e) e.stopPropagation();

    // If the item is already selected, unselect it
    if (selections[category]?.id === item.id) {
      setSelections(prev => ({ ...prev, [category]: null }));
      return;
    }

    setSelections(prev => {
      const next = { ...prev, [category]: item };
      // Auto-reset incompatible parts
      if (category === 'cpu') {
        if (next.motherboard && next.motherboard.socket !== item.socket) next.motherboard = null;
      }
      if (category === 'motherboard') {
        if (next.ram && next.ram.type !== item.ramType) next.ram = null;
      }
      return next;
    });
  };

  // --- ENGINES --- //

  // Power Engine
  const totalTDP = useMemo(() => {
    let tdp = 0;
    Object.values(selections).forEach(item => {
      if (item && item.tdp) tdp += item.tdp;
    });
    return tdp;
  }, [selections]);

  const recommendedPSU = totalTDP > 0 ? totalTDP + 150 : 0;

  // Compatibility Warnings
  const warnings = useMemo(() => {
    let alerts = [];

    // PSU check
    if (selections.psu && recommendedPSU > 0) {
      if (selections.psu.wattage < recommendedPSU) {
        alerts.push({ type: 'error', text: `Power Warning: Your system requires at least ${recommendedPSU}W, but you selected a ${selections.psu.wattage}W PSU.` });
      }
    }

    // Bottleneck check (CPU vs GPU)
    if (selections.cpu && selections.gpu) {
      const diff = selections.cpu.tier - selections.gpu.tier;
      if (diff >= 4) {
        alerts.push({ type: 'warning', text: `Bottleneck Detected: Your ${selections.cpu.name} is significantly more powerful than your GPU. Consider a better GPU.` });
      } else if (diff <= -4) {
        alerts.push({ type: 'warning', text: `Bottleneck Detected: Your ${selections.gpu.name} is being severely limited by your CPU. Consider upgrading the processor.` });
      } else {
        alerts.push({ type: 'success', text: `Great Pairing! Your CPU and GPU are well balanced for maximum performance.` });
      }
    }

    // Socket warnings (pre-selection)
    if (selections.cpu && !selections.motherboard) {
      alerts.push({ type: 'info', text: `You selected an ${selections.cpu.socket} CPU. Please select a compatible ${selections.cpu.socket} Motherboard.` });
    }

    return alerts;
  }, [selections, recommendedPSU]);

  const totals = useMemo(() => {
    let price = 0;
    let items = 0;
    Object.values(selections).forEach(item => {
      if (item) {
        price += item.price;
        items += 1;
      }
    });
    return { price, items };
  }, [selections]);

  // Exporter
  const exportPDF = async () => {
    if (!pdfRef.current) return;
    const canvas = await html2canvas(pdfRef.current, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('FTFX-PC-Quotation.pdf');
  };

  const getAIPanelClass = (type) => {
    if (type === 'error') return styles.aiPanelError;
    if (type === 'warning') return styles.aiPanelWarning;
    return '';
  };

  const getAIIcon = (type) => {
    if (type === 'error') return '🚨';
    if (type === 'warning') return '⚠️';
    if (type === 'success') return '✅';
    return '💡';
  };

  return (
    <div className={`container ${styles.setupPage}`}>
      <div className={styles.header}>
        <BackButton />
        <div className={styles.headerTitles}>
          <h1>Enterprise PC Builder</h1>
          <p>AI-Powered Compatibility Engine & Bottleneck Detector</p>
          <div style={{ marginTop: '16px' }}>
            <Link href="/guide" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#e0f2fe', color: '#0369a1', padding: '10px 20px', borderRadius: '10px', textDecoration: 'none', fontWeight: 'bold', border: '1px solid #bae6fd' }}>
              <span>📚</span> New to this? Read our Beginner's PC Building Guide
            </Link>
          </div>
        </div>
      </div>

      {warnings.length > 0 && (
        <div className={styles.alertsContainer}>
          {warnings.map((alert, idx) => (
            <div key={idx} className={`${styles.aiPanel} ${getAIPanelClass(alert.type)}`}>
              <div className={styles.aiIcon}>{getAIIcon(alert.type)}</div>
              <div className={styles.aiText}>
                <h4>AI System Analyst</h4>
                <p>{alert.text}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className={styles.configGrid}>
        <div className={styles.builderArea}>
          {Object.keys(PC_PARTS).map((category) => (
            <div key={category} className={`${styles.categoryBlock} ${expandedCategory === category ? styles.expanded : ''}`}>
              
              <div className={styles.categoryHeader} onClick={() => setExpandedCategory(expandedCategory === category ? null : category)}>
                <h2>Select {category.toUpperCase()} {selections[category] ? <span style={{color: '#10b981', marginLeft: '8px'}}>✓</span> : ''}</h2>
                <svg className={styles.expandIcon} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </div>

              <div className={styles.categoryContent}>
                <div className={styles.optionsList}>
                  {PC_PARTS[category].map((item) => {
                    const isSelected = selections[category]?.id === item.id;
                    
                    // Compute disabled state based on strict compatibility
                    let isDisabled = false;
                    if (category === 'motherboard' && selections.cpu && item.socket !== selections.cpu.socket) isDisabled = true;
                    if (category === 'ram' && selections.motherboard && item.type !== selections.motherboard.ramType) isDisabled = true;

                    return (
                      <div 
                        key={item.id} 
                        className={`${styles.itemCard} ${isSelected ? styles.selectedCard : ''} ${isDisabled ? styles.disabled : ''}`}
                        onClick={(e) => !isDisabled && handleSelect(category, item, e)}
                      >
                        <div className={styles.itemImage}>
                          <Image src={item.img} alt={item.name} fill style={{ objectFit: 'contain' }} />
                        </div>
                        
                        <div className={styles.itemInfo}>
                          <div className={styles.itemHeader}>
                            <h4>
                              {item.name} 
                              {isDisabled && <span style={{color: 'red', fontSize: '0.8rem', marginLeft: '10px'}}>(Incompatible)</span>}
                            </h4>
                            <span className={styles.badgeTier}>Tier {item.tier || 'N/A'}</span>
                          </div>
                          
                          <div className={styles.specsList}>
                            {item.socket && <span className={styles.specItem}>Socket {item.socket}</span>}
                            {item.ramType && <span className={styles.specItem}>{item.ramType}</span>}
                            {item.type && <span className={styles.specItem}>{item.type}</span>}
                            {item.tdp && <span className={styles.specItem}>{item.tdp}W TDP</span>}
                            {item.wattage && <span className={styles.specItem}>{item.wattage}W</span>}
                          </div>

                          <div className={styles.pricing}>
                            <span className={styles.price}>{formatPrice(item.price)}</span>
                          </div>
                        </div>

                        <button className={styles.addButton} onClick={(e) => !isDisabled && handleSelect(category, item, e)}>
                          {isSelected ? 'Added ✓' : 'Add to Build'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          ))}
        </div>

        <div className={styles.summarySidebar}>
          <div className={styles.summaryBox} ref={pdfRef}>
            <h3>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>
              Build Quotation
            </h3>
            
            <div className={styles.selectedItemsList}>
              {Object.keys(selections).map(category => (
                selections[category] && (
                  <div key={category} className={styles.summaryRow}>
                    <span className={styles.summaryLabel}>{category.toUpperCase()}</span>
                    <span className={styles.summaryVal}>
                      {selections[category].name}
                      <span style={{color: 'var(--primary)', marginBottom: '4px'}}>{formatPrice(selections[category].price)}</span>
                      
                      {/* Individual Buy Link */}
                      <a 
                        href={`https://www.amazon.in/s?k=${encodeURIComponent(selections[category].name)}&tag=ftfxtechsolut-21`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className={styles.summaryBuyBtn}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                        Buy Now
                      </a>
                    </span>
                  </div>
                )
              ))}
              {totals.items === 0 && <p style={{color: 'var(--text-secondary)', fontStyle: 'italic', fontSize: '0.9rem'}}>No components selected yet.</p>}
            </div>

            <div className={styles.powerDraw}>
              <span>Est. Power Draw:</span>
              <span style={{color: totalTDP > 0 ? '#ef4444' : 'inherit'}}>{totalTDP}W</span>
            </div>

            <div className={styles.grandTotal}>
              <span>Grand Total:</span>
              <span style={{ color: 'var(--primary)' }}>{formatPrice(totals.price)}</span>
            </div>
          </div>

          <div style={{marginTop: '24px'}}>
            <button 
              className={styles.exportBtn}
              onClick={exportPDF}
              disabled={totals.items === 0}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              Export as PDF Quotation
            </button>
            <p style={{fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'center', marginTop: '16px'}}>
              * Use the individual "Buy Now" buttons in the quotation to purchase from vendors instantly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
