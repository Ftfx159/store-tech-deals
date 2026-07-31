"use client";
import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import styles from './PriceHistoryChart.module.css';

export default function PriceHistoryChart({ data }) {
  if (!data || data.length < 2) {
    return null; // Not enough data to plot
  }

  // Format data for chart
  const chartData = data.map(item => ({
    date: new Date(item.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    price: item.price
  }));

  const minPrice = Math.min(...chartData.map(d => d.price));
  const maxPrice = Math.max(...chartData.map(d => d.price));
  
  // Add some padding to Y axis
  const padding = (maxPrice - minPrice) * 0.1 || minPrice * 0.1;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className={styles.customTooltip}>
          <p className={styles.label}>{`${label}`}</p>
          <p className={styles.price}>{`₹${payload[0].value.toLocaleString('en-IN')}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={styles.chartContainer}>
      <h3 className={styles.chartTitle}>Price History</h3>
      <div className={styles.responsiveWrapper}>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
            <XAxis 
              dataKey="date" 
              tick={{ fill: '#888', fontSize: 12 }} 
              axisLine={false} 
              tickLine={false} 
              minTickGap={20}
            />
            <YAxis 
              domain={[minPrice - padding, maxPrice + padding]}
              tick={{ fill: '#888', fontSize: 12 }} 
              axisLine={false} 
              tickLine={false}
              tickFormatter={(value) => `₹${value.toLocaleString('en-IN')}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="price" 
              stroke="#00ffcc" 
              strokeWidth={3} 
              dot={{ r: 4, fill: '#1a1a2e', stroke: '#00ffcc', strokeWidth: 2 }} 
              activeDot={{ r: 6, fill: '#00ffcc', stroke: '#fff', strokeWidth: 2 }}
              animationDuration={1500}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
