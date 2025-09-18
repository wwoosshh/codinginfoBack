import { Request, Response } from 'express';
import Article, { ArticleStatus } from '../models/Article';
import User from '../models/User';
import logger from '../utils/logger';
import mongoose from 'mongoose';

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    logger.info('Admin dashboard stats requested', {
      adminId: req.user?.userId,
      timestamp: new Date().toISOString()
    });

    const [
      totalArticles,
      publishedArticles,
      draftArticles,
      totalUsers,
      activeUsers,
      totalViews,
    ] = await Promise.all([
      Article.countDocuments(),
      Article.countDocuments({ status: ArticleStatus.PUBLISHED }),
      Article.countDocuments({ status: ArticleStatus.DRAFT }),
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      Article.aggregate([
        { $group: { _id: null, totalViews: { $sum: '$viewCount' } } }
      ]),
    ]);

    const recentArticles = await Article.find()
      .populate('author', 'username email')
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title status author createdAt category');

    const stats = {
      articles: {
        total: totalArticles,
        published: publishedArticles,
        draft: draftArticles,
      },
      users: {
        total: totalUsers,
        active: activeUsers,
      },
      engagement: {
        totalViews: totalViews[0]?.totalViews || 0,
      },
      recentArticles,
    };

    logger.info('Dashboard stats retrieved successfully', {
      adminId: req.user?.userId,
      stats: {
        totalArticles,
        totalUsers,
        totalViews: totalViews[0]?.totalViews || 0
      }
    });

    res.json(stats);
  } catch (error) {
    logger.error('Error fetching dashboard stats', {
      error: error instanceof Error ? error.message : 'Unknown error',
      adminId: req.user?.userId
    });
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const search = req.query.search as string;
    const role = req.query.role as string;
    const status = req.query.status as string;

    let query: any = {};

    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (role && ['admin', 'user'].includes(role)) {
      query.role = role;
    }

    if (status === 'active') {
      query.isActive = true;
    } else if (status === 'inactive') {
      query.isActive = false;
    }

    const [users, totalUsers] = await Promise.all([
      User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(query),
    ]);

    logger.info('Users list retrieved', {
      adminId: req.user?.userId,
      page,
      limit,
      totalUsers,
      query
    });

    res.json({
      users,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalUsers / limit),
        totalUsers,
        hasNextPage: page < Math.ceil(totalUsers / limit),
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    logger.error('Error fetching users', {
      error: error instanceof Error ? error.message : 'Unknown error',
      adminId: req.user?.userId
    });
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateUserStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ message: 'isActive must be a boolean' });
    }

    const user = await User.findById(id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'admin' && !isActive) {
      return res.status(400).json({ message: 'Cannot deactivate admin users' });
    }

    user.isActive = isActive;
    await user.save();

    logger.info('User status updated', {
      adminId: req.user?.userId,
      targetUserId: id,
      newStatus: isActive,
      targetUsername: user.username
    });

    res.json({
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      user: user
    });
  } catch (error) {
    logger.error('Error updating user status', {
      error: error instanceof Error ? error.message : 'Unknown error',
      adminId: req.user?.userId,
      targetUserId: req.params.id
    });
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot delete admin users' });
    }

    if (req.user?.userId === id) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    await Article.updateMany(
      { author: id },
      { status: ArticleStatus.ARCHIVED }
    );

    await User.findByIdAndDelete(id);

    logger.info('User deleted', {
      adminId: req.user?.userId,
      deletedUserId: id,
      deletedUsername: user.username
    });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    logger.error('Error deleting user', {
      error: error instanceof Error ? error.message : 'Unknown error',
      adminId: req.user?.userId,
      targetUserId: req.params.id
    });
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getAllArticlesAdmin = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const search = req.query.search as string;
    const category = req.query.category as string;
    const status = req.query.status as string;
    const author = req.query.author as string;

    let query: any = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (category) {
      query.category = category;
    }

    if (status && Object.values(ArticleStatus).includes(status as ArticleStatus)) {
      query.status = status;
    }

    if (author && mongoose.Types.ObjectId.isValid(author)) {
      query.author = author;
    }

    const [articles, totalArticles] = await Promise.all([
      Article.find(query)
        .populate('author', 'username email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Article.countDocuments(query),
    ]);

    logger.info('Admin articles list retrieved', {
      adminId: req.user?.userId,
      page,
      limit,
      totalArticles,
      query
    });

    res.json({
      articles,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalArticles / limit),
        totalArticles,
        hasNextPage: page < Math.ceil(totalArticles / limit),
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    logger.error('Error fetching admin articles', {
      error: error instanceof Error ? error.message : 'Unknown error',
      adminId: req.user?.userId
    });
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateArticleStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid article ID' });
    }

    if (!Object.values(ArticleStatus).includes(status)) {
      return res.status(400).json({
        message: 'Invalid status',
        validStatuses: Object.values(ArticleStatus)
      });
    }

    const article = await Article.findById(id).populate('author', 'username');
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    const oldStatus = article.status;
    article.status = status;
    await article.save();

    logger.info('Article status updated', {
      adminId: req.user?.userId,
      articleId: id,
      oldStatus,
      newStatus: status,
      articleTitle: article.title,
      authorId: article.author
    });

    res.json({
      message: 'Article status updated successfully',
      article
    });
  } catch (error) {
    logger.error('Error updating article status', {
      error: error instanceof Error ? error.message : 'Unknown error',
      adminId: req.user?.userId,
      articleId: req.params.id
    });
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteArticleAdmin = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid article ID' });
    }

    const article = await Article.findById(id).populate('author', 'username');
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    await Article.findByIdAndDelete(id);

    logger.info('Article deleted by admin', {
      adminId: req.user?.userId,
      deletedArticleId: id,
      articleTitle: article.title,
      originalAuthor: article.author
    });

    res.json({ message: 'Article deleted successfully' });
  } catch (error) {
    logger.error('Error deleting article', {
      error: error instanceof Error ? error.message : 'Unknown error',
      adminId: req.user?.userId,
      articleId: req.params.id
    });
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createArticle = async (req: Request, res: Response) => {
  try {
    const { title, description, content, category, status, tags, imageUrl, slug } = req.body;

    if (!title || !description || !content || !category) {
      return res.status(400).json({
        message: 'Title, description, content, and category are required'
      });
    }

    // Check if slug already exists
    if (slug) {
      const existingArticle = await Article.findOne({ slug });
      if (existingArticle) {
        return res.status(400).json({ message: 'Slug already exists' });
      }
    }

    const articleData: any = {
      title,
      description,
      content,
      category,
      author: req.user?.userId,
      status: status || ArticleStatus.DRAFT,
      tags: tags || [],
      slug: slug || title.toLowerCase().replace(/[^a-z0-9가-힣\s-]/g, '').replace(/\s+/g, '-').trim()
    };

    if (imageUrl) {
      articleData.imageUrl = imageUrl;
    }

    const article = new Article(articleData);
    await article.save();

    const populatedArticle = await Article.findById(article._id).populate('author', 'username email');

    logger.info('Article created by admin', {
      adminId: req.user?.userId,
      articleId: article._id,
      articleTitle: article.title,
      status: article.status
    });

    res.status(201).json({
      message: 'Article created successfully',
      article: populatedArticle
    });
  } catch (error) {
    logger.error('Error creating article', {
      error: error instanceof Error ? error.message : 'Unknown error',
      adminId: req.user?.userId,
      body: req.body
    });
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateArticle = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, content, category, status, tags, imageUrl, slug } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid article ID' });
    }

    const article = await Article.findById(id);
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    // Check if slug already exists (exclude current article)
    if (slug && slug !== article.slug) {
      const existingArticle = await Article.findOne({ slug, _id: { $ne: id } });
      if (existingArticle) {
        return res.status(400).json({ message: 'Slug already exists' });
      }
    }

    // Update fields
    if (title) article.title = title;
    if (description) article.description = description;
    if (content) article.content = content;
    if (category) article.category = category;
    if (status) article.status = status;
    if (tags !== undefined) article.tags = tags;
    if (imageUrl !== undefined) article.imageUrl = imageUrl;
    if (slug) article.slug = slug;

    await article.save();

    const populatedArticle = await Article.findById(article._id).populate('author', 'username email');

    logger.info('Article updated by admin', {
      adminId: req.user?.userId,
      articleId: id,
      articleTitle: article.title,
      changes: req.body
    });

    res.json({
      message: 'Article updated successfully',
      article: populatedArticle
    });
  } catch (error) {
    logger.error('Error updating article', {
      error: error instanceof Error ? error.message : 'Unknown error',
      adminId: req.user?.userId,
      articleId: req.params.id,
      body: req.body
    });
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getArticleById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid article ID' });
    }

    const article = await Article.findById(id).populate('author', 'username email');
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    logger.info('Article retrieved by admin', {
      adminId: req.user?.userId,
      articleId: id,
      articleTitle: article.title
    });

    res.json(article);
  } catch (error) {
    logger.error('Error fetching article', {
      error: error instanceof Error ? error.message : 'Unknown error',
      adminId: req.user?.userId,
      articleId: req.params.id
    });
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getSystemHealth = async (req: Request, res: Response) => {
  try {
    const dbState = mongoose.connection.readyState;
    const dbStateMap = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
    };

    const [articleCount, userCount] = await Promise.all([
      Article.countDocuments(),
      User.countDocuments(),
    ]);

    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: {
        status: dbStateMap[dbState as keyof typeof dbStateMap],
        connected: dbState === 1,
      },
      collections: {
        articles: articleCount,
        users: userCount,
      },
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.env.npm_package_version || '1.2.2',
    };

    logger.info('System health check performed', {
      adminId: req.user?.userId,
      health: {
        dbStatus: health.database.status,
        uptime: health.uptime,
        articleCount,
        userCount
      }
    });

    res.json(health);
  } catch (error) {
    logger.error('Error checking system health', {
      error: error instanceof Error ? error.message : 'Unknown error',
      adminId: req.user?.userId
    });
    res.status(500).json({
      status: 'unhealthy',
      message: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
};