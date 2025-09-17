import { Request, Response } from 'express';
import Article, { Category } from '../models/Article';

export const getAllArticles = async (req: Request, res: Response) => {
  try {
    const articles = await Article.find().sort({ createdAt: -1 });
    res.json(articles);
  } catch (error) {
    console.error('Error fetching articles:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getArticleBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const article = await Article.findOne({ slug });

    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    res.json(article);
  } catch (error) {
    console.error('Error fetching article by slug:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getArticlesByCategory = async (req: Request, res: Response) => {
  try {
    const { category } = req.params;

    if (!Object.values(Category).includes(category as Category)) {
      return res.status(400).json({ message: 'Invalid category' });
    }

    const articles = await Article.find({ category }).sort({ createdAt: -1 });
    res.json(articles);
  } catch (error) {
    console.error('Error fetching articles by category:', error);
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
    const { title, description, content, category, slug, imageUrl } = req.body;

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
    });

    await article.save();
    res.status(201).json(article);
  } catch (error) {
    console.error('Error creating article:', error);
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