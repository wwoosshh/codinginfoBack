import { Request, Response } from 'express';
import Category from '../models/Category';
import Article from '../models/Article';
import logger from '../utils/logger';
import mongoose from 'mongoose';

export const getAllCategories = async (req: Request, res: Response) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ order: 1, createdAt: 1 });

    logger.info('Categories retrieved by admin', {
      adminId: req.user?.userId,
      categoriesCount: categories.length
    });

    res.json(categories);
  } catch (error) {
    logger.error('Error fetching categories', {
      error: error instanceof Error ? error.message : 'Unknown error',
      adminId: req.user?.userId
    });
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createCategory = async (req: Request, res: Response) => {
  try {
    const { key, displayName, description, color, order } = req.body;

    if (!key || !displayName || !description || !color) {
      return res.status(400).json({
        message: 'Key, display name, description, and color are required'
      });
    }

    // Check if key already exists
    const existingCategory = await Category.findOne({ key: key.toUpperCase() });
    if (existingCategory) {
      return res.status(400).json({ message: 'Category key already exists' });
    }

    const categoryData = {
      key: key.toUpperCase(),
      displayName,
      description,
      color,
      order: order || 0
    };

    const category = new Category(categoryData);
    await category.save();

    logger.info('Category created by admin', {
      adminId: req.user?.userId,
      categoryId: category._id,
      categoryKey: category.key,
      categoryName: category.displayName
    });

    res.status(201).json({
      message: 'Category created successfully',
      category
    });
  } catch (error) {
    logger.error('Error creating category', {
      error: error instanceof Error ? error.message : 'Unknown error',
      adminId: req.user?.userId,
      body: req.body
    });
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { displayName, description, color, order, isActive } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid category ID' });
    }

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Update fields (key cannot be updated for data integrity)
    if (displayName) category.displayName = displayName;
    if (description) category.description = description;
    if (color) category.color = color;
    if (order !== undefined) category.order = order;
    if (isActive !== undefined) category.isActive = isActive;

    await category.save();

    logger.info('Category updated by admin', {
      adminId: req.user?.userId,
      categoryId: id,
      categoryKey: category.key,
      changes: req.body
    });

    res.json({
      message: 'Category updated successfully',
      category
    });
  } catch (error) {
    logger.error('Error updating category', {
      error: error instanceof Error ? error.message : 'Unknown error',
      adminId: req.user?.userId,
      categoryId: req.params.id,
      body: req.body
    });
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid category ID' });
    }

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Check if category is used by any articles
    const articlesCount = await Article.countDocuments({ category: category.key });
    if (articlesCount > 0) {
      return res.status(400).json({
        message: `Cannot delete category. ${articlesCount} article(s) are using this category.`,
        articlesCount
      });
    }

    await Category.findByIdAndDelete(id);

    logger.info('Category deleted by admin', {
      adminId: req.user?.userId,
      deletedCategoryId: id,
      categoryKey: category.key,
      categoryName: category.displayName
    });

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    logger.error('Error deleting category', {
      error: error instanceof Error ? error.message : 'Unknown error',
      adminId: req.user?.userId,
      categoryId: req.params.id
    });
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getCategoryById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid category ID' });
    }

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Get article count for this category
    const articlesCount = await Article.countDocuments({ category: category.key });

    logger.info('Category retrieved by admin', {
      adminId: req.user?.userId,
      categoryId: id,
      categoryKey: category.key
    });

    res.json({
      ...category.toObject(),
      articlesCount
    });
  } catch (error) {
    logger.error('Error fetching category', {
      error: error instanceof Error ? error.message : 'Unknown error',
      adminId: req.user?.userId,
      categoryId: req.params.id
    });
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getCategoryStats = async (req: Request, res: Response) => {
  try {
    const categories = await Category.find({ isActive: true });
    const stats = await Promise.all(
      categories.map(async (category) => {
        const articlesCount = await Article.countDocuments({ category: category.key });
        const publishedCount = await Article.countDocuments({
          category: category.key,
          status: 'published'
        });

        return {
          ...category.toObject(),
          articlesCount,
          publishedCount
        };
      })
    );

    logger.info('Category stats retrieved by admin', {
      adminId: req.user?.userId,
      categoriesCount: categories.length
    });

    res.json(stats);
  } catch (error) {
    logger.error('Error fetching category stats', {
      error: error instanceof Error ? error.message : 'Unknown error',
      adminId: req.user?.userId
    });
    res.status(500).json({ message: 'Internal server error' });
  }
};