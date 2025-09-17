import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import connectDB from './config/database';
import { seedData } from './utils/seedData';
import articleRoutes from './routes/articles';
import authRoutes from './routes/auth';

dotenv.config();

const app = express();
const PORT: number = parseInt(process.env.PORT || '5159', 10);

const initializeServer = async () => {
  try {
    await connectDB();
    await seedData();
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
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/api/articles', articleRoutes);
app.use('/api/auth', authRoutes);

app.get('/health', (req, res) => {
  res.json({
    status: 'UP',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

app.use((req, res) => {
  res.status(404).json({
    message: 'Route not found',
    path: req.originalUrl,
  });
});

app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📄 Health check: http://localhost:${PORT}/health`);
  console.log(`🌐 External access: http://[YOUR_IP]:${PORT}/health`);
  console.log(`🔗 Frontend should connect to: http://[YOUR_IP]:${PORT}`);
});