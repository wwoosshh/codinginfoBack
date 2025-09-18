import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import connectDB from './config/database';
import { setupSwagger } from './config/swagger';
import { globalErrorHandler, notFoundHandler } from './utils/errorHandler';
import { requestLogger } from './utils/logger';
import articleRoutes from './routes/articles';
import authRoutes from './routes/auth';
import adminRoutes from './routes/admin';
import mongoose from 'mongoose';

dotenv.config();

const app = express();
const PORT: number = parseInt(process.env.PORT || '5159', 10);

const initializeServer = async () => {
  try {
    await connectDB();
    console.log('✅ Server initialization completed');
  } catch (error) {
    console.error('❌ Server initialization failed:', error);
    process.exit(1);
  }
};

initializeServer();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});

app.set('trust proxy', 1);
app.use(helmet());
app.use(limiter);
app.use(compression());
app.use(morgan('combined'));
app.use(requestLogger);
app.use(cors({
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:3000'],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

setupSwagger(app);

app.use('/api/articles', articleRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

app.get('/health', async (req, res) => {
  try {
    // Check database connection
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';

    // Check memory usage
    const memUsage = process.memoryUsage();
    const memUsageMB = {
      rss: Math.round(memUsage.rss / 1024 / 1024),
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
      external: Math.round(memUsage.external / 1024 / 1024),
    };

    res.json({
      status: 'UP',
      timestamp: new Date().toISOString(),
      version: '1.3.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      database: {
        status: dbStatus,
        name: 'MongoDB Atlas',
      },
      memory: memUsageMB,
      node: process.version,
    });
  } catch (error) {
    res.status(503).json({
      status: 'DOWN',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
    });
  }
});

app.use(notFoundHandler);
app.use(globalErrorHandler);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📄 Health check: http://localhost:${PORT}/health`);
  console.log(`🌐 External access: http://[YOUR_IP]:${PORT}/health`);
  console.log(`🔗 Frontend should connect to: http://[YOUR_IP]:${PORT}`);
});