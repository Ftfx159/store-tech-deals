"use client";
import React, { useState, useEffect } from 'react';
import styles from './page.module.css';
import Link from 'next/link';

const VOLUMES = [
  { id: 'vol1', title: 'Volume 1 — Hardware Fundamentals', type: 'full' },
  { id: 'vol2', title: 'Volume 2 — Choosing Components', type: 'full' },
  { id: 'vol3', title: 'Volume 3 — Compatibility Guide', type: 'summary', chapters: [{ name: 'CPU & Motherboard', points: ['Socket Matching', 'Chipset limits'] }, { name: 'RAM & Clearance', points: ['DDR4 vs DDR5', 'Cooler heights'] }, { name: 'Power & BIOS', points: ['PSU Wattage rules', 'BIOS Flashback'] }] },
  { id: 'vol4', title: 'Volume 4 — Tools Required', type: 'summary', chapters: [{ name: 'Essentials', points: ['Phillips Screwdriver', 'Thermal Paste', 'Flash Drive'] }, { name: 'Safety', points: ['Anti-static Strap', 'Magnetic Tray'] }] },
  { id: 'vol5', title: 'Volume 5 — Building the PC', type: 'full' },
  { id: 'vol6', title: 'Volume 6 — First Boot', type: 'summary', chapters: [{ name: 'BIOS Config', points: ['Update BIOS', 'Enable XMP/EXPO', 'Secure Boot'] }, { name: 'Tuning', points: ['Resizable BAR', 'Fan Curves'] }] },
  { id: 'vol7', title: 'Volume 7 — Windows Installation', type: 'summary', chapters: [{ name: 'OS Setup', points: ['Create Bootable USB', 'Partition SSD', 'Activation'] }] },
  { id: 'vol8', title: 'Volume 8 — Driver Installation', type: 'summary', chapters: [{ name: 'Core Drivers', points: ['Chipset', 'LAN / Wi-Fi', 'GPU Drivers'] }] },
  { id: 'vol9', title: 'Volume 9 — Essential Software', type: 'summary', chapters: [{ name: 'Monitoring', points: ['HWInfo', 'CPU-Z', 'MSI Afterburner'] }, { name: 'Productivity', points: ['7-Zip', 'VLC', 'VS Code'] }] },
  { id: 'vol10', title: 'Volume 10 — Gaming Optimization', type: 'summary', chapters: [{ name: 'Performance', points: ['Game Mode', 'DLSS / FSR', 'Frame Generation'] }] },
  { id: 'vol11', title: 'Volume 11 — Productivity Opt.', type: 'summary', chapters: [{ name: 'Workloads', points: ['Adobe Premiere', 'Blender', 'VMware'] }] },
  { id: 'vol12', title: 'Volume 12 — AI Workstation', type: 'summary', chapters: [{ name: 'Local AI', points: ['LM Studio', 'Stable Diffusion', 'VRAM Requirements'] }] },
  { id: 'vol13', title: 'Volume 13 — Benchmarking', type: 'summary', chapters: [{ name: 'Testing', points: ['Cinebench', '3DMark', 'CrystalDiskMark'] }] },
  { id: 'vol14', title: 'Volume 14 — Stress Testing', type: 'summary', chapters: [{ name: 'Stability', points: ['OCCT', 'Prime95', 'MemTest86'] }] },
  { id: 'vol15', title: 'Volume 15 — Troubleshooting', type: 'summary', chapters: [{ name: 'Common Issues', points: ['No Display / No POST', 'Blue Screen', 'High Temps'] }] },
  { id: 'vol16', title: 'Volume 16 — Cable Management', type: 'summary', chapters: [{ name: 'Routing', points: ['Hidden Cables', 'RGB Wiring', 'Zip Ties vs Velcro'] }] },
  { id: 'vol17', title: 'Volume 17 — Maintenance', type: 'summary', chapters: [{ name: 'Upkeep', points: ['Dust Removal', 'Thermal Paste Replacement', 'SSD Health'] }] },
  { id: 'vol18', title: 'Volume 18 — Upgrading', type: 'summary', chapters: [{ name: 'Pathways', points: ['CPU Upgrade', 'Storage Expansion', 'GPU Swaps'] }] },
  { id: 'vol19', title: 'Volume 19 — Recommended Builds', type: 'full' },
  { id: 'vol20', title: 'Volume 20 — Buying Guide', type: 'summary', chapters: [{ name: 'Market Nav', points: ['OEM vs Retail', 'Avoiding Scams', 'Seasonal Sales'] }] },
];

export default function GuidePage() {
  const [activeId, setActiveId] = useState('vol1');

  useEffect(() => {
    const handleScroll = () => {
      const sections = VOLUMES.map(v => document.getElementById(v.id));
      const scrollPosition = window.scrollY + 150; // Offset for sticky header
      
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section && section.offsetTop <= scrollPosition) {
          setActiveId(section.id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      const y = element.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <div className={styles.docLayout}>
      
      {/* LEFT SIDEBAR NAVIGATION */}
      <nav className={styles.sidebar}>
        <div className={styles.sidebarTitle}>Index</div>
        <div className={styles.sidebarNav}>
          {VOLUMES.map((vol) => (
            <div 
              key={vol.id} 
              className={`${styles.navItem} ${activeId === vol.id ? styles.activeNavItem : ''}`}
              onClick={() => scrollToSection(vol.id)}
            >
              {vol.title}
            </div>
          ))}
        </div>
      </nav>

      {/* RIGHT CONTENT AREA */}
      <main className={styles.contentArea}>
        
        {/* VOL 1 */}
        <section id="vol1" className={styles.volumeBlock}>
          <h2 className={styles.volumeHeader}><span>Volume 1</span> Hardware Fundamentals</h2>
          <div className={styles.fullArticle}>
            <p>Welcome to the Ultimate PC Building Guide (2026 Edition). Before touching a screwdriver, you must understand the anatomy of a PC.</p>
            
            <h3>What is a Computer?</h3>
            <p>At its core, a PC is a collection of specific components communicating over a main circuit board (the Motherboard). The <strong>CPU</strong> does the thinking, the <strong>RAM</strong> remembers what it's currently thinking about, the <strong>Storage (SSD/HDD)</strong> is the long-term memory, the <strong>GPU</strong> draws the pictures on your screen, and the <strong>Power Supply (PSU)</strong> gives them all electricity.</p>

            <h3>Storage Technologies</h3>
            <p>We have moved far beyond spinning hard drives (HDDs). Modern systems use NVMe SSDs that plug directly into the motherboard via PCIe lanes. PCIe Gen 4 can hit speeds of 7,000 MB/s, while PCIe Gen 5 pushes past 14,000 MB/s. Always install your OS on an NVMe SSD.</p>

            <div className={styles.proTip}>
              <h4>💡 Pro Tip: The RGB Ecosystem</h4>
              <p>RGB lighting looks great, but mixing brands (like Corsair fans with NZXT coolers) often requires installing multiple bloated software programs. Try to stick to one ecosystem if you want synchronized lighting.</p>
            </div>
          </div>
        </section>

        {/* VOL 2 */}
        <section id="vol2" className={styles.volumeBlock}>
          <h2 className={styles.volumeHeader}><span>Volume 2</span> Choosing Components</h2>
          <div className={styles.fullArticle}>
            <h3>Step 1: Choose Your Budget</h3>
            <p>Your budget dictates your monitor resolution. ₹40,000 is great for 1080p Esports. ₹80,000 unlocks 1440p High settings. ₹1.5 Lakh+ pushes into 4K Ultra and AI workstation territory.</p>

            <h3>Step 2: Select the CPU</h3>
            <p>For gaming, single-core speed matters most (Intel Core i5 / AMD Ryzen 5 is plenty). For heavy video editing, compiling code, or 3D rendering, core count matters (Core i9 / Ryzen 9).</p>

            <h3>Step 3: Motherboard Chipsets</h3>
            <p>Intel chipsets starting with 'Z' (Z790, Z890) allow CPU overclocking. 'B' series (B760) are for mainstream users who don't overclock. AMD uses 'X' (X670) for extreme enthusiasts and 'B' (B650) for mainstream. Ensure the socket matches your CPU.</p>

            <h3>Step 4: RAM (Memory)</h3>
            <p>32GB is the new standard for 2026. If using DDR5, aim for 6000MHz speed as the sweet spot for stability and performance. Always buy RAM in pairs (e.g., 2x16GB) to run in Dual Channel mode, which doubles your bandwidth.</p>
          </div>
        </section>

        {/* DYNAMIC SUMMARIES FOR VOL 3, 4 */}
        {VOLUMES.slice(2, 4).map(vol => (
          <section id={vol.id} key={vol.id} className={styles.volumeBlock}>
            <h2 className={styles.volumeHeader}><span>{vol.title.split(' — ')[0]}</span> {vol.title.split(' — ')[1]}</h2>
            <div className={styles.chapterList}>
              {vol.chapters.map((chap, idx) => (
                <div key={idx} className={styles.chapterCard}>
                  <div className={styles.chapterTitle}>{chap.name}</div>
                  <ul className={styles.chapterPoints}>
                    {chap.points.map((pt, i) => <li key={i}>{pt}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        ))}

        {/* VOL 5 */}
        <section id="vol5" className={styles.volumeBlock}>
          <h2 className={styles.volumeHeader}><span>Volume 5</span> Building the PC</h2>
          <div className={styles.fullArticle}>
            <h3>Step 1: Prepare Workspace</h3>
            <p>Clear a large table. Do not build on carpet to avoid static electricity. Take your motherboard out and place it on top of its cardboard box. This is your test bench.</p>

            <h3>Step 2: Install CPU</h3>
            <p>Lift the retention arm. Line up the golden triangle on the bottom corner of the CPU with the triangle on the motherboard socket. Gently drop it in. Do not push. Lock the arm back down.</p>

            <h3>Step 3: Install RAM</h3>
            <p>Check your motherboard manual (usually slots 2 and 4 are filled first). Push the RAM stick straight down until you hear a loud CLICK from both sides.</p>

            <div className={styles.proTip}>
              <h4>🚨 Safety First: Stand-offs</h4>
              <p>When moving the motherboard into the PC case (Step 7), ensure the metal stand-offs in the case align perfectly with the holes in the motherboard. A misplaced stand-off can short-circuit the board!</p>
            </div>
          </div>
        </section>

        {/* DYNAMIC SUMMARIES FOR VOL 6-18 */}
        {VOLUMES.slice(5, 18).map(vol => (
          <section id={vol.id} key={vol.id} className={styles.volumeBlock}>
            <h2 className={styles.volumeHeader}><span>{vol.title.split(' — ')[0]}</span> {vol.title.split(' — ')[1]}</h2>
            <div className={styles.chapterList}>
              {vol.chapters.map((chap, idx) => (
                <div key={idx} className={styles.chapterCard}>
                  <div className={styles.chapterTitle}>{chap.name}</div>
                  <ul className={styles.chapterPoints}>
                    {chap.points.map((pt, i) => <li key={i}>{pt}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        ))}

        {/* VOL 19 */}
        <section id="vol19" className={styles.volumeBlock}>
          <h2 className={styles.volumeHeader}><span>Volume 19</span> Recommended Builds</h2>
          <div className={styles.fullArticle}>
            <h3>1. The Budget Gamer (₹60k - ₹80k)</h3>
            <p>Target: 1080p High FPS Gaming. <br/>Recommended: Intel Core i5 / AMD Ryzen 5, 16GB DDR4, 1TB NVMe, RTX 4060 or RX 7600.</p>
            
            <h3>2. The Creator Workstation (₹1.5L - ₹3L)</h3>
            <p>Target: 4K Video Editing, 3D Rendering. <br/>Recommended: Intel Core i9 / Ryzen 9, 64GB DDR5, 4TB Gen4 NVMe, RTX 4080 SUPER.</p>

            <h3>3. AI Workstation (RTX 50-Series Class)</h3>
            <p>Target: Local LLMs, Stable Diffusion. <br/>Recommended: VRAM is king here. Aim for RTX 4090 (24GB VRAM) or multiple high-VRAM cards, 128GB DDR5 System RAM, 1000W+ Platinum PSU.</p>

            <div style={{ marginTop: '40px', textAlign: 'center' }}>
              <Link href="/setup" style={{ display: 'inline-block', background: '#3b82f6', color: 'white', padding: '16px 32px', borderRadius: '12px', textDecoration: 'none', fontWeight: 'bold', fontSize: '1.2rem' }}>
                Use our AI Configurator to verify your parts
              </Link>
            </div>
          </div>
        </section>

        {/* VOL 20 */}
        <section id="vol20" className={styles.volumeBlock}>
          <h2 className={styles.volumeHeader}><span>Volume 20</span> Buying Guide</h2>
          <div className={styles.chapterList}>
            <div className={styles.chapterCard}>
              <div className={styles.chapterTitle}>Market Navigation</div>
              <ul className={styles.chapterPoints}>
                <li>OEM vs Retail Parts</li>
                <li>Identifying Fake GPUs</li>
                <li>When to buy (Seasonal Sales)</li>
              </ul>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
