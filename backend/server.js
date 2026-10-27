import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import productRoutes from './routes/productRoutes.js';
import discoveryRoutes from './routes/discoveryRoutes.js';
import commerceRoutes from './routes/commerceRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5050;

// CORS setup
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : null;

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, or node test runner)
    if (!origin || !allowedOrigins) {
      return callback(null, true);
    }
    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      return callback(null, true);
    }
    return callback(new Error('Blocked by Atelier CORS security policy'));
  },
  credentials: true,
}));

app.use(express.json());

// Serve static images for perfume bottles
const publicImagesPath = path.resolve(__dirname, '../frontend/public/images');
app.use('/images', express.static(publicImagesPath));

// Routes
app.use('/api/products', productRoutes);
app.use('/api/discovery', discoveryRoutes);
app.use('/api/commerce', commerceRoutes);
app.use('/api/admin', adminRoutes);

// Health check & API Overview
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.json({
    status: 'online',
    app: 'VIBE PERFUME Luxury API',
    version: '2.0.0',
    endpoints: {
      health: '/api/health',
      products: '/api/products',
      discovery: '/api/discovery',
      commerce: '/api/commerce',
      admin: '/api/admin'
    }
  });
});

const isTestEnv = process.env.NODE_ENV === 'test' || process.argv.some(arg => arg.includes('test'));
if (!isTestEnv) {
  app.listen(PORT, () => {
    console.log(`[VibePerfume Backend] Running on port ${PORT}`);
  });
}

export default app;
