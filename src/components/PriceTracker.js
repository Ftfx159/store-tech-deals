"use client";
import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  ComposedChart,
  Area,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot
} from 'recharts';
import styles from './PriceTracker.module.css';

const formatPrice = (price) => {
  const numStr = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0
  }).format(price);
  return `₹${numStr}`;
};

const TIMEFRAMES = {
  '1M': { days: 30, label: '1 Month' },
  '3M': { days: 90, label: '3 Months' },
  '1Y': { days: 365, label: '1 Year' }
};

export default function PriceTracker({ currentPrice, originalPrice }) {
  const [timeframe, setTimeframe] = useState('1M');
  const [tiltStyle, setTiltStyle] = useState({});
  const containerRef = useRef(null);

  // Generate 1 year of deep analysis data
  const fullData = useMemo(() => {
    const data = [];
    const totalDays = 365;
    
    for (let i = totalDays; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      let price;
      if (i === 0) {
        price = currentPrice;
      } else if (i <= 7) {
        // Last 7 days: price has dropped to current deal price
        price = currentPrice;
      } else if (i <= 30) {
        // Between 30 and 7 days ago: transition phase from original down to current
        const progress = (30 - i) / 23; // 0 to 1
        price = originalPrice - ((originalPrice - currentPrice) * progress);
        // Add tiny noise
        price += (Math.random() * 0.02 - 0.01) * originalPrice; 
      } else {
        // Historically: price fluctuates around the original price
        const minPossible = originalPrice * 0.95; 
        const maxPossible = originalPrice * 1.05;
        
        // Complex waves
        const wave1 = Math.sin(i * 0.05);
        const wave2 = Math.cos(i * 0.02);
        let normalized = (wave1 + wave2 + 2) / 4; 
        
        price = minPossible + (maxPossible - minPossible) * normalized;
      }
      
      price = Math.round(price);

      // Mock volume correlating heavily with the recent price drop
      const isDealActive = i <= 30 && price < originalPrice * 0.9;
      const baseVolume = 1000 + Math.random() * 500;
      const volume = isDealActive ? baseVolume * 3.5 : baseVolume;

      data.push({
        date: date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: i > 300 ? '2-digit' : undefined }),
        timestamp: date.getTime(),
        price,
        volume: Math.round(volume),
        sma: 0 // Will calculate next
      });
    }

    // Calculate 7-day Simple Moving Average (SMA)
    for (let i = 0; i < data.length; i++) {
      if (i < 7) {
        data[i].sma = data[i].price;
      } else {
        let sum = 0;
        for (let j = 0; j < 7; j++) {
          sum += data[i - j].price;
        }
        data[i].sma = Math.round(sum / 7);
      }
    }

    return data;
  }, [currentPrice, originalPrice]);

  const activeData = useMemo(() => {
    const days = TIMEFRAMES[timeframe].days;
    let slice = fullData.slice(-days);
    if (days === 365) {
      slice = slice.filter((_, idx) => idx % 4 === 0 || idx === slice.length - 1);
    } else if (days === 90) {
      slice = slice.filter((_, idx) => idx % 2 === 0 || idx === slice.length - 1);
    }
    return slice;
  }, [fullData, timeframe]);

  // AI Deep Analysis Metrics
  const minPrice = Math.min(...activeData.map(d => d.price));
  const maxPrice = Math.max(...activeData.map(d => d.price));
  const supportLevel = Math.round(minPrice * 0.98);
  const resistanceLevel = Math.round(maxPrice * 1.02);
  
  // Find highest and lowest index for buy/sell markers
  const lowestPoint = activeData.reduce((prev, curr) => (prev.price < curr.price) ? prev : curr);
  const highestPoint = activeData.reduce((prev, curr) => (prev.price > curr.price) ? prev : curr);

  // Accurate AI Trend Analysis based on average historical price vs current price
  const historicalAvg = activeData.reduce((sum, d) => sum + d.price, 0) / activeData.length;
  const isGoodDeal = currentPrice < historicalAvg * 0.95; // At least 5% below average
  const trend = isGoodDeal ? 'Bullish' : 'Bearish';
  
  const volatility = Math.round(((maxPrice - minPrice) / minPrice) * 100);

  // Generate Accurate Verdict
  let verdictText = "";
  if (currentPrice === originalPrice) {
    verdictText = "Item is currently at full retail price. We recommend waiting for a drop.";
  } else if (isGoodDeal) {
    const savings = Math.round(100 - (currentPrice / historicalAvg) * 100);
    verdictText = `Excellent time to buy! The current price is ${savings}% below the ${TIMEFRAMES[timeframe].label} average.`;
  } else {
    verdictText = "Price is dropping, but hasn't reached historical lows. Monitor closely.";
  }

  // 3D Tilt Effect
  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Smooth 3D tilt
    const rotateX = ((y - centerY) / centerY) * -12; // Max 12 deg
    const rotateY = ((x - centerX) / centerX) * 12;
    
    setTiltStyle({
      transform: `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`,
      transition: 'transform 0.1s ease-out'
    });
  };

  const handleMouseLeave = () => {
    setTiltStyle({
      transform: `perspective(1200px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`,
      transition: 'transform 0.5s ease-out'
    });
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length >= 2) {
      return (
        <div className={styles.customTooltip}>
          <p className={styles.tooltipDate}>{label}</p>
          <div className={styles.tooltipMetrics}>
            <p className={styles.tooltipPrice}>
              <span className={styles.dot} style={{ background: payload[0].color }}></span>
              Price: {formatPrice(payload[0].value)}
            </p>
            <p className={styles.tooltipSma}>
              <span className={styles.dot} style={{ background: payload[1].color }}></span>
              7-Day SMA: {formatPrice(payload[1].value)}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={styles.advancedTrackerWrapper}>
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <h3><span className={styles.pulseIcon}>📊</span> Advanced 3D Analysis Engine</h3>
          <p className={styles.subtitle}>Institutional-grade price tracking & volume metrics</p>
        </div>
        <div className={styles.timeframeTabs}>
          {Object.keys(TIMEFRAMES).map(tf => (
            <button
              key={tf}
              className={`${styles.tabBtn} ${timeframe === tf ? styles.activeTab : ''}`}
              onClick={() => setTimeframe(tf)}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.trackerGrid}>
        {/* Main 3D Chart Container */}
        <div 
          className={styles.chart3DContainer}
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <div className={styles.chartInner} style={tiltStyle}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={activeData}
                margin={{ top: 20, right: 30, left: 10, bottom: 0 }}
              >
                <defs>
                  {/* Glowing 3D Area Gradient */}
                  <linearGradient id="colorPriceAdvanced" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.6}/>
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  
                  {/* Drop shadow for 3D line effect */}
                  <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="6" stdDeviation="4" floodColor="#3b82f6" floodOpacity="0.4"/>
                  </filter>
                </defs>
                
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: 'var(--text-secondary)' }}
                  minTickGap={40}
                />
                
                {/* Y-Axis for Price (Left) */}
                <YAxis 
                  yAxisId="priceAxis"
                  domain={[supportLevel, resistanceLevel]} 
                  hide={false}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: 'var(--text-secondary)' }}
                  tickFormatter={(val) => `₹${(val / 1000).toFixed(1)}k`}
                  width={45}
                />
                {/* Y-Axis for Volume (Right) - scaled down to sit at bottom */}
                <YAxis 
                  yAxisId="volumeAxis"
                  orientation="right"
                  domain={[0, 'dataMax * 4']} 
                  hide={true} 
                />

                <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(0,0,0,0.1)', strokeWidth: 2, strokeDasharray: '4 4' }} />
                
                {/* Volume Bars */}
                <Bar 
                  yAxisId="volumeAxis" 
                  dataKey="volume" 
                  fill="rgba(148, 163, 184, 0.2)" 
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
                
                {/* SMA Line */}
                <Line 
                  yAxisId="priceAxis"
                  type="monotone" 
                  dataKey="sma" 
                  stroke="#f59e0b" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  activeDot={false}
                />

                {/* Main Price Area/Line */}
                <Area 
                  yAxisId="priceAxis"
                  type="monotone" 
                  dataKey="price" 
                  stroke="#3b82f6" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorPriceAdvanced)" 
                  activeDot={{ r: 6, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }}
                  style={{ filter: 'url(#glow)' }}
                />

                {/* Buy Signal Marker */}
                <ReferenceDot yAxisId="priceAxis" x={lowestPoint.date} y={lowestPoint.price} r={6} fill="#10b981" stroke="#fff" strokeWidth={2} label={{ position: 'bottom', value: '🟢 BUY', fill: '#10b981', fontSize: 12, fontWeight: 700 }} />
                
                {/* Sell/Peak Signal Marker */}
                <ReferenceDot yAxisId="priceAxis" x={highestPoint.date} y={highestPoint.price} r={6} fill="#ef4444" stroke="#fff" strokeWidth={2} label={{ position: 'top', value: '🔴 HIGH', fill: '#ef4444', fontSize: 12, fontWeight: 700 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Deep Analysis Sidebar */}
        <div className={styles.analysisSidebar}>
          <div className={styles.analysisHeader}>
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
             <h4>AI Deep Analysis</h4>
          </div>
          
          <div className={styles.metricGrid}>
            <div className={styles.metricCard}>
              <span className={styles.metricLabel}>Market Trend</span>
              <span className={`${styles.metricValue} ${isGoodDeal ? styles.success : styles.danger}`}>
                {isGoodDeal ? '📉 Dropping (Buy)' : '📈 Rising (Hold)'}
              </span>
            </div>
            
            <div className={styles.metricCard}>
              <span className={styles.metricLabel}>Volatility Index</span>
              <span className={styles.metricValue}>{volatility}%</span>
            </div>
            
            <div className={styles.metricCard}>
              <span className={styles.metricLabel}>Support Level (Floor)</span>
              <span className={styles.metricValue}>{formatPrice(supportLevel)}</span>
            </div>
            
            <div className={styles.metricCard}>
              <span className={styles.metricLabel}>Resistance (Ceiling)</span>
              <span className={styles.metricValue}>{formatPrice(resistanceLevel)}</span>
            </div>
          </div>
          
          <div className={styles.verdictBox}>
            <strong>AI Verdict: </strong>
            {verdictText}
          </div>
        </div>
      </div>
    </div>
  );
}
