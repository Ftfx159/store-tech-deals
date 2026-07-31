import cron from 'node-cron';
import dotenv from 'dotenv';
// Node 18+ has native fetch

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const API_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const SYNC_SECRET = process.env.SYNC_SECRET || process.env.ADMIN_PASSWORD || 'Tanish&2018';

console.log(`=============================================`);
console.log(`[Cron Daemon] Initialized`);
console.log(`[Cron Daemon] Target URL : ${API_URL}/api/sync`);
console.log(`[Cron Daemon] Schedule   : Every 30 minutes`);
console.log(`=============================================`);
console.log(`Leave this process running in the background (e.g. via PM2)`);

// Schedule task to run every 30 minutes (*/30 * * * *)
cron.schedule('*/30 * * * *', async () => {
  const timestamp = new Date().toISOString();
  console.log(`\n[Cron Daemon] [${timestamp}] Executing background sync...`);
  
  try {
    const response = await fetch(`${API_URL}/api/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SYNC_SECRET}`
      },
      body: JSON.stringify({ category: 'All' })
    });

    const text = await response.text();
    try {
      const data = JSON.parse(text);
      if (response.ok) {
        console.log(`[Cron Daemon] SUCCESS:`, data.message || data);
      } else {
        console.error(`[Cron Daemon] FAILED (${response.status}):`, data.error || data);
      }
    } catch(e) {
      console.error(`[Cron Daemon] FAILED (${response.status}): Invalid JSON response`, text.substring(0, 200));
    }
  } catch (error) {
    console.error(`[Cron Daemon] NETWORK ERROR: Could not reach ${API_URL}/api/sync.`);
    console.error(`Make sure the Next.js server is actively running! Error: ${error.message}`);
  }
});
