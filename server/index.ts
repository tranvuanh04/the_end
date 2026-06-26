import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
import path from 'path';
import { fileURLToPath } from 'url';
import membersRouter from './routes/members';
import feedbacksRouter from './routes/feedbacks';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/the_end';

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/members', membersRouter);
app.use('/api/feedbacks', feedbacksRouter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve frontend static files
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, '../dist');

app.use(express.static(distPath));

// For client-side routing, fallback to index.html
app.get('*splat', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// Connect to MongoDB and start server
const connectWithFallback = async () => {
  if (MONGODB_URI.startsWith('mongodb+srv://')) {
    const host = MONGODB_URI.split('@')[1]?.split('/')[0]?.split('?')[0];
    if (host) {
      try {
        await dns.promises.resolveSrv(`_mongodb._tcp.${host}`);
      } catch (err) {
        console.warn('⚠️ SRV DNS resolution failed, falling back to public DNS (1.1.1.1, 8.8.8.8)...');
        try {
          dns.setServers(['1.1.1.1', '8.8.8.8']);
        } catch (dnsErr) {
          console.error('Failed to set DNS servers:', dnsErr);
        }
      }
    }
  }

  await mongoose.connect(MONGODB_URI);
};

connectWithFallback()
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

export default app;
