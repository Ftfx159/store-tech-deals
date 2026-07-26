"use client";

import { useState } from 'react';
import styles from './page.module.css';

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [logMessage, setLogMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

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
          'Authorization': 'Bearer dev-secret'
        }
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
          <h3>Database Synchronization</h3>
          <p>
            Trigger a manual sync to fetch fresh deals from Amazon immediately. 
            This process will update all current prices and specifically search for brand new tech gadgets and lightning deals to add to your catalog.
          </p>
          <p style={{marginTop: '10px', fontSize: '0.9rem', color: '#888'}}>
            Note: This takes about 10-15 seconds to avoid API rate limits.
          </p>
        </div>

        <button 
          onClick={handleSync} 
          disabled={isSyncing}
          className={styles.syncBtn}
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
              Sync New Deals
            </>
          )}
        </button>

        {logMessage && (
          <div className={styles.logBox}>
            {logMessage}
          </div>
        )}
      </div>
    </div>
  );
}
