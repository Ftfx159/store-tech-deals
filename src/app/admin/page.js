"use client";

import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import styles from './page.module.css';

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [logMessage, setLogMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [syncCategory, setSyncCategory] = useState('All');
  const [stats, setStats] = useState(null);

  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#0ea5e9'];

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch(e) {
      console.error("Failed to fetch stats", e);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchStats();
    }
  }, [isAuthenticated]);

  const handleLogin = (e) => {
    e.preventDefault();
    // Simple frontend protection to prevent random visitors from hitting the API
    if (password === 'Tanish&2018') {
      setIsAuthenticated(true);
      setErrorMsg('');
    } else {
      setErrorMsg('Incorrect password');
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    setLogMessage('Initiating background synchronization...');
    
    try {
      // The API endpoint relies on a header secret to prevent abuse
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${password}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ category: syncCategory })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setLogMessage(`SUCCESS: ${data.message}\nNew products have been added and existing prices are updated!`);
      } else {
        setLogMessage(`ERROR: ${data.error || 'Failed to sync'}`);
      }
    } catch (err) {
      setLogMessage(`CRITICAL ERROR: ${err.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className={styles.adminContainer}>
        <div className={styles.loginBox}>
          <h1>Admin Access</h1>
          <p>Please enter your password to continue.</p>
          <form onSubmit={handleLogin}>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.inputField}
              placeholder="Password"
              autoFocus
            />
            {errorMsg && <div className={styles.errorText}>{errorMsg}</div>}
            <button type="submit" className="btn btn-primary" style={{width: '100%'}}>
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.adminContainer}>
      <div className={styles.dashboard}>
        <div className={styles.dashboardHeader}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="3" y1="9" x2="21" y2="9"></line>
            <line x1="9" y1="21" x2="9" y2="9"></line>
          </svg>
          <h1>Store Dashboard</h1>
        </div>

        <div className={styles.statusCard}>
          <h3>Database Synchronization Queue</h3>
          <p>
            Trigger an incremental background sync. The system automatically prioritizes 
            fetching fresh data for products that haven't been updated in over 12 hours to conserve API limits.
          </p>
        </div>

        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px', marginBottom: '20px' }}>
            <div className={styles.statusCard} style={{ margin: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <h3>Catalog Health</h3>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--accent-primary)', marginTop: '10px' }}>
                {stats.totalProducts} <span style={{fontSize: '1rem', color: '#888'}}>Total Items</span>
              </div>
              <div style={{ display: 'flex', gap: '20px', marginTop: '15px' }}>
                <div>
                  <div style={{ color: '#22c55e', fontWeight: 'bold' }}>{stats.inStock}</div>
                  <div style={{ fontSize: '0.8rem', color: '#888' }}>In Stock</div>
                </div>
                <div>
                  <div style={{ color: '#f43f5e', fontWeight: 'bold' }}>{stats.outOfStock}</div>
                  <div style={{ fontSize: '0.8rem', color: '#888' }}>Out of Stock</div>
                </div>
              </div>
            </div>
            
            <div className={styles.statusCard} style={{ margin: 0, height: '250px' }}>
              <h3 style={{ marginBottom: '10px' }}>AI Category Distribution</h3>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.categories}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {stats.categories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                    itemStyle={{ color: '#e2e8f0' }}
                  />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
          <select 
            value={syncCategory} 
            onChange={(e) => setSyncCategory(e.target.value)}
            className={styles.inputField}
            style={{ width: '250px', background: 'white' }}
            disabled={isSyncing}
          >
            <option value="All">All Categories (Full Sync)</option>
            <option value="electronics sale">Lightning Deals</option>
            <option value="best selling laptops">Trending Products</option>
            <option value="usb flash drive 128gb">Pendrives & Storage</option>
            <option value="micro sd memory card">Memory Cards</option>
            <option value="pc graphics card processor">PC Components</option>
            <option value="smart home devices alexa">Smart Home</option>
            <option value="streaming microphone webcam">Creator Tech</option>
            <option value="external hard drive 1tb">External HDDs</option>
            <option value="amazon fire tv stick">Streaming Devices</option>
            <option value="google nest chromecast">Google Products</option>
          </select>
          <button 
            onClick={handleSync} 
            disabled={isSyncing}
            className={styles.syncBtn}
            style={{ marginTop: 0 }}
          >
            {isSyncing ? (
              <>
                <svg className={styles.spinIcon} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
                </svg>
                Syncing... Please wait
              </>
            ) : (
              <>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.59-9.21l-5.46-5.46"></path>
                </svg>
                Sync {syncCategory === 'All' ? 'All' : 'Category'}
              </>
            )}
          </button>
        </div>

        {logMessage && (
          <div className={styles.logBox}>
            {logMessage}
          </div>
        )}
      </div>
    </div>
  );
}
