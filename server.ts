import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Enable JSON body parser with generous limit for full store snapshots
app.use(express.json({ limit: '15mb' }));

// Snapshot directory and persistence file
const DATA_DIR = path.resolve(__dirname, 'data');
const SNAPSHOT_FILE = path.join(DATA_DIR, 'store_snapshot.json');

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Bine Cloud Sync & Store API'
  });
});

// GET /api/store-data - Retrieve latest published store snapshot
app.get('/api/store-data', (_req, res) => {
  try {
    if (!fs.existsSync(SNAPSHOT_FILE)) {
      return res.json({
        uninitialized: true,
        message: 'No store data published yet. Cashier needs to click Publish in the POS app.',
        publishedAt: null,
        data: null
      });
    }

    const fileContent = fs.readFileSync(SNAPSHOT_FILE, 'utf-8');
    const parsed = JSON.parse(fileContent);
    return res.json({
      uninitialized: false,
      ...parsed
    });
  } catch (error) {
    console.error('Error reading store snapshot:', error);
    return res.status(500).json({ error: 'Failed to retrieve published store data' });
  }
});

// POST /api/publish - Save and distribute store snapshot
app.post('/api/publish', (req, res) => {
  try {
    const payload = req.body;
    if (!payload || !payload.summary) {
      return res.status(400).json({ error: 'Invalid store snapshot payload format' });
    }

    const snapshot = {
      storeId: payload.storeId || 'bine-store-default',
      businessName: payload.businessName || 'Bine Store',
      currency: payload.currency || 'MWK',
      publishedAt: new Date().toISOString(),
      publishedBy: payload.publishedBy || 'Store Register',
      summary: payload.summary,
      products: payload.products || [],
      sales: payload.sales || [],
      debtors: payload.debtors || [],
      expenses: payload.expenses || [],
      settings: payload.settings || {},
      version: Date.now()
    };

    fs.writeFileSync(SNAPSHOT_FILE, JSON.stringify(snapshot, null, 2), 'utf-8');

    return res.json({
      success: true,
      message: 'Store snapshot published successfully',
      publishedAt: snapshot.publishedAt,
      version: snapshot.version
    });
  } catch (error) {
    console.error('Error saving store snapshot:', error);
    return res.status(500).json({ error: 'Failed to save store snapshot to server' });
  }
});

// Set up Vite middlewares in development or static serving in production
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Bine POS & Cloud API Server running on port ${PORT}`);
  });
}

startServer();
