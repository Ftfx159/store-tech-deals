import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { searchAmazonProducts } from '@/lib/amazonApi';
import nodemailer from 'nodemailer';

// Configure Nodemailer (Using ethereal/sandbox if no real SMTP provided)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.ethereal.email",
  port: process.env.SMTP_PORT || 587,
  auth: {
    user: process.env.SMTP_USER || "test@ethereal.email",
    pass: process.env.SMTP_PASS || "testpass",
  },
});

export async function POST(request) {
  try {
    const authHeader = request.headers.get('authorization');
    const providedSecret = authHeader ? authHeader.replace('Bearer ', '') : null;
    
    const syncSecret = process.env.SYNC_SECRET;
    const adminPassword = process.env.ADMIN_PASSWORD || 'Tanish&2018';
    const devFallback = process.env.NODE_ENV !== 'production' ? 'dev-secret' : null;
    
    if (!providedSecret || (providedSecret !== syncSecret && providedSecret !== adminPassword && providedSecret !== devFallback)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let syncCategory = 'All';
    try {
      const body = await request.json();
      if (body && body.category) {
        syncCategory = body.category;
      }
    } catch(e) {
      // Ignore if no JSON body
    }

    console.log(`[Sync API] Starting background catalog synchronization. Target: ${syncCategory}`);

    let allQueries = [];

    if (syncCategory !== 'All') {
      // Sync only the specifically requested category
      allQueries = [syncCategory];
    } else {
      // 1. Get all queries, prioritizing stale data (Incremental Sync Queue)
      const staleProducts = await prisma.product.findMany({
        select: { searchQuery: true, lastUpdated: true },
        where: { searchQuery: { not: null } },
        orderBy: { lastUpdated: 'asc' }
      });

      const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);
      
      // Find queries that haven't been synced in 12+ hours
      const staleQueries = staleProducts
        .filter(p => new Date(p.lastUpdated) < twelveHoursAgo)
        .map(p => p.searchQuery)
        .filter(Boolean);

      let uniqueStaleQueries = [...new Set(staleQueries)];
      
      // Add "Discovery" queries to force searching for entirely new deals
      const discoveryQueries = [
        "new tech gadgets",
        "latest electronics releases",
        "best smartphones",
        "gaming accessories sale",
        "usb flash drive 128gb",
        "micro sd memory card",
        "pc graphics card processor",
        "smart home devices alexa",
        "streaming microphone webcam",
        "external hard drive 1tb",
        "amazon fire tv stick",
        "google nest chromecast"
      ];
      
      // Combine stale queries with discovery queries, ensuring uniqueness.
      // HARD CAP at 15 queries per sync run to prevent RapidAPI rate limits (429 Too Many Requests)
      allQueries = [...new Set([...uniqueStaleQueries, ...discoveryQueries])].slice(0, 15);
    }

    console.log(`[Sync API] Incremental Queue processing ${allQueries.length} queries.`);

    let totalUpdated = 0;

    // 2. Resync each query
    for (const query of allQueries) {
      console.log(`[Sync API] Resyncing query: "${query}"`);
      // We wrap in try-catch so one failing query doesn't crash the whole sync
      try {
        const liveProducts = await searchAmazonProducts(query);
        
        for (const p of liveProducts) {
          // Check for price drop alerts before upserting
          try {
            const triggeredAlerts = await prisma.priceAlert.findMany({
              where: {
                productId: p.id,
                targetPrice: { gte: p.discountedPrice }
              }
            });

            if (triggeredAlerts.length > 0) {
              for (const alert of triggeredAlerts) {
                console.log(`[Sync API] 📧 Sending Price Drop Alert to ${alert.email} for ${p.name}`);
                
                // Fire off email asynchronously
                transporter.sendMail({
                  from: '"Orvessa" <alerts@orvessa.com>',
                  to: alert.email,
                  subject: `Price Drop Alert: ${p.name.slice(0, 30)}...`,
                  html: `<h3>Great news!</h3>
                         <p>The price for <strong>${p.name}</strong> just dropped to <strong>₹${p.discountedPrice}</strong>.</p>
                         <p>This is below your target price of ₹${alert.targetPrice}!</p>
                         <p><a href="${process.env.NEXT_PUBLIC_SITE_URL}/product/${p.id}">Click here to grab the deal!</a></p>`
                }).catch(err => console.error("Email failed:", err.message));

                // Delete the alert so we don't spam them repeatedly
                await prisma.priceAlert.delete({ where: { id: alert.id } });
              }
            }
          } catch (alertError) {
            console.error(`[Sync API] Alert processing failed for ${p.id}`, alertError);
          }

          const upsertedProduct = await prisma.product.upsert({
            where: { id: p.id },
            update: {
              name: p.name,
              brand: p.brand || null,
              category: p.category || null,
              rating: p.rating || 0,
              reviews: p.reviews || 0,
              originalPrice: p.originalPrice || p.discountedPrice,
              discountedPrice: p.discountedPrice,
              primeEligible: p.primeEligible || false,
              inStock: p.inStock !== false,
              imageUrl: p.imageUrl,
              lastUpdated: new Date()
            },
            create: {
              id: p.id,
              name: p.name,
              brand: p.brand || null,
              category: p.category || null,
              rating: p.rating || 0,
              reviews: p.reviews || 0,
              originalPrice: p.originalPrice || p.discountedPrice,
              discountedPrice: p.discountedPrice,
              primeEligible: p.primeEligible || false,
              inStock: p.inStock !== false,
              features: p.features ? JSON.stringify(p.features) : null,
              amazonUrl: p.amazonUrl,
              imageUrl: p.imageUrl,
              tags: p.tags ? JSON.stringify(p.tags) : null,
              couponCode: p.couponCode || null,
              searchQuery: query
            }
          });
          
          // Record price history
          await prisma.priceHistory.create({
            data: {
              productId: upsertedProduct.id,
              price: upsertedProduct.discountedPrice
            }
          });
          
          totalUpdated++;
        }
      } catch (err) {
        console.error(`[Sync API] Failed to sync query "${query}":`, err);
      }
      
      // Delay between queries to avoid hitting rate limits
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    return NextResponse.json({ 
      success: true, 
      message: `Sync complete. Updated ${totalUpdated} products across ${allQueries.length} categories.` 
    });

  } catch (error) {
    console.error('[Sync API Error]', error);
    return NextResponse.json({ error: 'Failed to synchronize catalog' }, { status: 500 });
  }
}
