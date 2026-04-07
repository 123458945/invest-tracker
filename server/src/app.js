import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

import errorHandler from './middleware/errorHandler.middleware.js';
import { apiLimiter } from './middleware/rateLimiter.middleware.js';

import authRoutes from './routes/auth.routes.js';
import holdingsRoutes from './routes/holdings.routes.js';
import stocksRoutes from './routes/stocks.routes.js';
import alertsRoutes from './routes/alerts.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import emailRoutes from './routes/email.routes.js';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: false,
  crossOriginOpenerPolicy: false,
}));
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/holdings', holdingsRoutes);
app.use('/api/stocks', stocksRoutes);
app.use('/api/alerts', alertsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/email', emailRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 生产环境下托管前端静态文件
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientDist = path.resolve(__dirname, '../../client/dist');
app.use(express.static(clientDist));
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(clientDist, 'index.html'));
  }
});

app.use(apiLimiter);
app.use(errorHandler);

export default app;
