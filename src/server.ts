import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import connectDB from './config/database';
import { setupSwagger } from './config/swagger';
import { testCloudinaryConnection } from './config/cloudinary';
import { globalErrorHandler, notFoundHandler } from './utils/errorHandler';
import { requestLogger } from './utils/logger';
import articleRoutes from './routes/articles';
import authRoutes from './routes/auth';
import adminRoutes from './routes/admin';
import categoryRoutes from './routes/categories';
import imageRoutes from './routes/images';
import aiConfigRoutes from './routes/aiConfig';
import aiConversationRoutes from './routes/aiConversations';
import mongoose from 'mongoose';

dotenv.config();

const app = express();
const PORT: number = parseInt(process.env.PORT || '5159', 10);

const initializeServer = async () => {
  try {
    await connectDB();
    await testCloudinaryConnection();
    console.log('✅ Server initialization completed');
  } catch (error) {
    console.error('❌ Server initialization failed:', error);
    process.exit(1);
  }
};

initializeServer();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 500, // IP당 15분에 500개 요청 허용 (기존 100개에서 대폭 증가)
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
    retryAfter: 15 * 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Rate limit 응답에도 CORS 헤더 포함
  skipSuccessfulRequests: false,
  skipFailedRequests: false
});

app.set('trust proxy', 1);
app.use(helmet());

// CORS를 Rate Limit보다 먼저 적용하여 429 응답에도 CORS 헤더 포함
app.use(cors({
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['https://codinginfo.vercel.app'],
  credentials: true,
}));

app.use(limiter);
app.use(compression());
app.use(morgan('combined'));
app.use(requestLogger);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

setupSwagger(app);

// 루트 경로 처리 (보안 스캐닝 대응)
app.get('/', (req, res) => {
  res.json({
    name: 'CodingInfo API',
    version: '1.4.0',
    docs: '/api-docs',
    health: '/health'
  });
});

app.use('/api/articles', articleRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/admin/ai-config', aiConfigRoutes);
app.use('/api/admin/ai-conversations', aiConversationRoutes);

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
      version: '1.3.2',
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

// Temporary endpoint to view all articles (including legacy ones)
app.get('/temp/all-articles', async (req, res) => {
  try {
    const Article = (await import('./models/Article')).default;
    const allArticles = await Article.find({});
    res.json({
      count: allArticles.length,
      articles: allArticles.map(a => ({
        _id: a._id,
        title: a.title,
        slug: a.slug,
        status: a.status || 'NO_STATUS',
        author: a.author || 'NO_AUTHOR',
        createdAt: a.createdAt
      }))
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch articles', message: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Temporary endpoint to view all users
app.get('/temp/all-users', async (req, res) => {
  try {
    const User = (await import('./models/User')).default;
    const allUsers = await User.find({}).select('-password');
    res.json({
      count: allUsers.length,
      users: allUsers
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users', message: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Temporary endpoint to delete all articles
app.delete('/temp/delete-all-articles', async (req, res) => {
  try {
    const Article = (await import('./models/Article')).default;
    const result = await Article.deleteMany({});
    res.json({
      success: true,
      deletedCount: result.deletedCount,
      message: `Deleted ${result.deletedCount} articles`
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete articles', message: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Temporary endpoint to make user admin
app.post('/temp/make-admin/:email', async (req, res) => {
  try {
    const User = (await import('./models/User')).default;
    const { email } = req.params;
    const user = await User.findOneAndUpdate(
      { email },
      { role: 'admin' },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      message: `User ${email} is now admin`,
      user
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to make admin', message: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Temporary endpoint to create admin user
app.post('/temp/create-admin', async (req, res) => {
  try {
    const User = (await import('./models/User')).default;
    const { email, password, username } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        error: 'User already exists',
        message: `User with email ${email} already exists`
      });
    }

    // Create new admin user (password will be auto-hashed by pre-save hook)
    const adminUser = new User({
      username: username || email.split('@')[0],
      email,
      password,
      role: 'admin',
      isActive: true
    });

    await adminUser.save();

    res.json({
      success: true,
      message: `Admin user created successfully`,
      user: {
        id: adminUser._id,
        username: adminUser.username,
        email: adminUser.email,
        role: adminUser.role
      }
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to create admin user',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.use(notFoundHandler);
app.use(globalErrorHandler);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📄 Health check: https://codinginfoback-production.up.railway.app/health`);
  console.log(`🌐 API Documentation: https://codinginfoback-production.up.railway.app/api-docs`);
  console.log(`🔗 Frontend: https://codinginfo.vercel.app`);
});