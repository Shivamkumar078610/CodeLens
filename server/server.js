require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

// ── Verify required env vars on startup ──────────────────────────────────
const required = ['MONGO_URI', 'JWT_SECRET', 'OPENROUTER_API_KEY'];
const missing = required.filter(k => !process.env[k]);
if (missing.length) {
  console.error('❌ Missing required environment variables:', missing.join(', '));
  console.error('   Make sure your .env file is in the server/ folder');
  process.exit(1);
}

const authRoutes    = require('./routes/authRoutes');
const reviewRoutes  = require('./routes/reviewRoutes');
const historyRoutes = require('./routes/historyRoutes');
const { errorHandler } = require('./middleware/errorHandler');
const { globalLimiter } = require('./middleware/rateLimiter');

const app  = express();
const PORT = process.env.PORT || 3001;

// ── CORS ─────────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── Body parsers ─────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(globalLimiter);

// ── Routes ───────────────────────────────────────────────────────────────
app.get('/api/health', (_, res) => res.json({ status: 'OK', timestamp: new Date() }));
app.use('/api/auth',    authRoutes);
app.use('/api/review',  reviewRoutes);
app.use('/api/history', historyRoutes);

// ── 404 ──────────────────────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

// ── Global error handler ─────────────────────────────────────────────────
app.use(errorHandler);

// ── Start ─────────────────────────────────────────────────────────────────
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running → http://localhost:${PORT}`);
      console.log(`🤖 AI Provider: OpenRouter`);
      console.log(`📌 Node.js version: ${process.version}`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });