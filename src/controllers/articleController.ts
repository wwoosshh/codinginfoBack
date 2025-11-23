import { Request, Response } from 'express';
import Article, { ArticleStatus } from '../models/Article';
import Category from '../models/Category';
import logger from '../utils/logger';
import mongoose from 'mongoose';
import { getChoseong } from 'es-hangul';

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

    if (category) {
      // 카테고리가 존재하는지 확인
      const categoryExists = await Category.findOne({ key: category.toUpperCase(), isActive: true });
      if (categoryExists) {
        query.category = category.toUpperCase();
      }
    }

    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      query.tags = { $in: tagArray };
    }

    const [articles, totalArticles, categories] = await Promise.all([
      Article.find(query)
        .populate('author', 'username')
        .sort({ publishedAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Article.countDocuments(query),
      Category.find({ isActive: true })
    ]);

    // 카테고리 정보를 맵으로 변환
    const categoryMap = new Map();
    categories.forEach(cat => {
      categoryMap.set(cat.key, {
        displayName: cat.displayName,
        color: cat.color
      });
    });

    // 아티클에 카테고리 정보 추가
    const articlesWithCategory = articles.map(article => {
      const articleObj = article.toObject();
      const categoryInfo = categoryMap.get(articleObj.category);
      return {
        ...articleObj,
        categoryDisplayName: categoryInfo?.displayName || articleObj.category,
        categoryColor: categoryInfo?.color || '#6b7280'
      };
    });

    logger.info('Articles fetched', {
      page,
      limit,
      totalArticles,
      query: { ...query, author: undefined }
    });

    res.json({
      articles: articlesWithCategory,
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
    const [article, category] = await Promise.all([
      Article.findOne({
        slug,
        status: ArticleStatus.PUBLISHED
      }).populate('author', 'username'),
      Category.findOne({ key: slug.split('-')[0]?.toUpperCase(), isActive: true })
    ]);

    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    // 카테고리 정보 추가
    const categoryInfo = await Category.findOne({ key: article.category, isActive: true });

    article.viewCount += 1;
    await article.save();

    const articleWithCategory = {
      ...article.toObject(),
      categoryDisplayName: categoryInfo?.displayName || article.category,
      categoryColor: categoryInfo?.color || '#6b7280'
    };

    logger.info('Article viewed', {
      articleId: article._id,
      slug: article.slug,
      viewCount: article.viewCount,
      title: article.title
    });

    res.json(articleWithCategory);
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

    // 카테고리가 존재하는지 확인
    const categoryExists = await Category.findOne({ key: category.toUpperCase(), isActive: true });
    if (!categoryExists) {
      return res.status(400).json({ message: 'Invalid category' });
    }

    const [articles, totalArticles, categories] = await Promise.all([
      Article.find({
        category: category.toUpperCase(),
        status: ArticleStatus.PUBLISHED
      })
        .populate('author', 'username')
        .sort({ publishedAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Article.countDocuments({
        category: category.toUpperCase(),
        status: ArticleStatus.PUBLISHED
      }),
      Category.find({ isActive: true })
    ]);

    // 카테고리 정보를 맵으로 변환
    const categoryMap = new Map();
    categories.forEach(cat => {
      categoryMap.set(cat.key, {
        displayName: cat.displayName,
        color: cat.color
      });
    });

    // 아티클에 카테고리 정보 추가
    const articlesWithCategory = articles.map(article => {
      const articleObj = article.toObject();
      const categoryInfo = categoryMap.get(articleObj.category);
      return {
        ...articleObj,
        categoryDisplayName: categoryInfo?.displayName || articleObj.category,
        categoryColor: categoryInfo?.color || '#6b7280'
      };
    });

    res.json({
      articles: articlesWithCategory,
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
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    if (!keyword || typeof keyword !== 'string') {
      return res.status(400).json({ message: 'Keyword is required' });
    }

    // 초성 검색 여부 확인 (한글 초성만 있는지)
    const hasChoseong = /^[ㄱ-ㅎ\s]+$/.test(keyword);

    let filteredArticles;

    if (hasChoseong) {
      // 초성 검색: 모든 published 아티클을 가져와서 클라이언트 사이드에서 필터링
      const [allArticles, categories] = await Promise.all([
        Article.find({ status: ArticleStatus.PUBLISHED })
          .populate('author', 'username')
          .sort({ publishedAt: -1, createdAt: -1 }),
        Category.find({ isActive: true })
      ]);

      // 초성 매칭 필터링
      filteredArticles = allArticles.filter(article => {
        const titleChoseong = getChoseong(article.title);
        const descriptionChoseong = getChoseong(article.description);
        return titleChoseong.includes(keyword) || descriptionChoseong.includes(keyword);
      });

      const totalArticles = filteredArticles.length;
      const paginatedArticles = filteredArticles.slice(skip, skip + limit);

      // 카테고리 정보를 맵으로 변환
      const categoryMap = new Map();
      categories.forEach(cat => {
        categoryMap.set(cat.key, {
          displayName: cat.displayName,
          color: cat.color
        });
      });

      // 아티클에 카테고리 정보 추가
      const articlesWithCategory = paginatedArticles.map(article => {
        const articleObj = article.toObject();
        const categoryInfo = categoryMap.get(articleObj.category);
        return {
          ...articleObj,
          categoryDisplayName: categoryInfo?.displayName || articleObj.category,
          categoryColor: categoryInfo?.color || '#6b7280'
        };
      });

      logger.info('Articles searched (chosung)', {
        keyword,
        page,
        limit,
        totalArticles
      });

      return res.json({
        articles: articlesWithCategory,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalArticles / limit),
          totalArticles,
          hasNextPage: page < Math.ceil(totalArticles / limit),
          hasPrevPage: page > 1,
        },
      });
    }

    // 일반 검색 (기존 방식)
    const query: any = {
      status: ArticleStatus.PUBLISHED,
      $or: [
        { title: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } },
        { content: { $regex: keyword, $options: 'i' } },
      ],
    };

    const [articles, totalArticles, categories] = await Promise.all([
      Article.find(query)
        .populate('author', 'username')
        .sort({ publishedAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Article.countDocuments(query),
      Category.find({ isActive: true })
    ]);

    // 카테고리 정보를 맵으로 변환
    const categoryMap = new Map();
    categories.forEach(cat => {
      categoryMap.set(cat.key, {
        displayName: cat.displayName,
        color: cat.color
      });
    });

    // 아티클에 카테고리 정보 추가
    const articlesWithCategory = articles.map(article => {
      const articleObj = article.toObject();
      const categoryInfo = categoryMap.get(articleObj.category);
      return {
        ...articleObj,
        categoryDisplayName: categoryInfo?.displayName || articleObj.category,
        categoryColor: categoryInfo?.color || '#6b7280'
      };
    });

    logger.info('Articles searched (normal)', {
      keyword,
      page,
      limit,
      totalArticles
    });

    res.json({
      articles: articlesWithCategory,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalArticles / limit),
        totalArticles,
        hasNextPage: page < Math.ceil(totalArticles / limit),
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    logger.error('Error searching articles', {
      error: error instanceof Error ? error.message : 'Unknown error',
      keyword: req.query.keyword
    });
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