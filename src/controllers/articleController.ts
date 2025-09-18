import { Request, Response } from 'express';
import Article, { Category, ArticleStatus } from '../models/Article';
import logger from '../utils/logger';
import mongoose from 'mongoose';

export const getAllArticles = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const search = req.query.search as string;
    const category = req.query.category as string;
    const tags = req.query.tags as string;

    let query: any = { status: ArticleStatus.PUBLISHED };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (category && Object.values(Category).includes(category as Category)) {
      query.category = category;
    }

    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      query.tags = { $in: tagArray };
    }

    const [articles, totalArticles] = await Promise.all([
      Article.find(query)
        .populate('author', 'username')
        .sort({ publishedAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Article.countDocuments(query),
    ]);

    logger.info('Articles fetched', {
      page,
      limit,
      totalArticles,
      query: { ...query, author: undefined }
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
    logger.error('Error fetching articles', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getArticleBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const article = await Article.findOne({
      slug,
      status: ArticleStatus.PUBLISHED
    }).populate('author', 'username');

    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    article.viewCount += 1;
    await article.save();

    logger.info('Article viewed', {
      articleId: article._id,
      slug: article.slug,
      viewCount: article.viewCount,
      title: article.title
    });

    res.json(article);
  } catch (error) {
    logger.error('Error fetching article by slug', {
      error: error instanceof Error ? error.message : 'Unknown error',
      slug: req.params.slug
    });
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getArticlesByCategory = async (req: Request, res: Response) => {
  try {
    const { category } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    if (!Object.values(Category).includes(category as Category)) {
      return res.status(400).json({ message: 'Invalid category' });
    }

    const [articles, totalArticles] = await Promise.all([
      Article.find({
        category,
        status: ArticleStatus.PUBLISHED
      })
        .populate('author', 'username')
        .sort({ publishedAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Article.countDocuments({
        category,
        status: ArticleStatus.PUBLISHED
      }),
    ]);

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
    logger.error('Error fetching articles by category', {
      error: error instanceof Error ? error.message : 'Unknown error',
      category: req.params.category
    });
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const searchArticles = async (req: Request, res: Response) => {
  try {
    const { keyword } = req.query;

    if (!keyword || typeof keyword !== 'string') {
      return res.status(400).json({ message: 'Keyword is required' });
    }

    const articles = await Article.find({
      $or: [
        { title: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } },
        { content: { $regex: keyword, $options: 'i' } },
      ],
    }).sort({ createdAt: -1 });

    res.json(articles);
  } catch (error) {
    console.error('Error searching articles:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createArticle = async (req: Request, res: Response) => {
  try {
    const {
      title,
      description,
      content,
      category,
      slug,
      imageUrl,
      tags = [],
      status = ArticleStatus.DRAFT
    } = req.body;

    if (!req.user?.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const existingArticle = await Article.findOne({ slug });
    if (existingArticle) {
      return res.status(400).json({ message: 'Article with this slug already exists' });
    }

    const article = new Article({
      title,
      description,
      content,
      category,
      slug,
      imageUrl,
      tags,
      status,
      author: req.user.userId,
    });

    await article.save();

    const populatedArticle = await Article.findById(article._id)
      .populate('author', 'username');

    logger.info('Article created', {
      articleId: article._id,
      authorId: req.user.userId,
      title: article.title,
      status: article.status,
      category: article.category
    });

    res.status(201).json(populatedArticle);
  } catch (error) {
    logger.error('Error creating article', {
      error: error instanceof Error ? error.message : 'Unknown error',
      authorId: req.user?.userId
    });
    if ((error as any).name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation error', error: (error as any).message });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateArticle = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const { title, description, content, category, imageUrl } = req.body;

    const article = await Article.findOneAndUpdate(
      { slug },
      { title, description, content, category, imageUrl },
      { new: true, runValidators: true }
    );

    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    res.json(article);
  } catch (error) {
    console.error('Error updating article:', error);
    if ((error as any).name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation error', error: (error as any).message });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteArticle = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    const article = await Article.findOneAndDelete({ slug });

    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting article:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};