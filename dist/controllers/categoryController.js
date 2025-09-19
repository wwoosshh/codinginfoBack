"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCategoryStats = exports.getCategoryById = exports.deleteCategory = exports.updateCategory = exports.createCategory = exports.getAllCategories = void 0;
const Category_1 = __importDefault(require("../models/Category"));
const Article_1 = __importDefault(require("../models/Article"));
const logger_1 = __importDefault(require("../utils/logger"));
const mongoose_1 = __importDefault(require("mongoose"));
const getAllCategories = async (req, res) => {
    try {
        const categories = await Category_1.default.find({ isActive: true }).sort({ order: 1, createdAt: 1 });
        logger_1.default.info('Categories retrieved by admin', {
            adminId: req.user?.userId,
            categoriesCount: categories.length
        });
        res.json(categories);
    }
    catch (error) {
        logger_1.default.error('Error fetching categories', {
            error: error instanceof Error ? error.message : 'Unknown error',
            adminId: req.user?.userId
        });
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getAllCategories = getAllCategories;
const createCategory = async (req, res) => {
    try {
        const { key, displayName, description, color, order } = req.body;
        if (!key || !displayName || !description || !color) {
            return res.status(400).json({
                message: 'Key, display name, description, and color are required'
            });
        }
        const existingCategory = await Category_1.default.findOne({ key: key.toUpperCase() });
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
        const category = new Category_1.default(categoryData);
        await category.save();
        logger_1.default.info('Category created by admin', {
            adminId: req.user?.userId,
            categoryId: category._id,
            categoryKey: category.key,
            categoryName: category.displayName
        });
        res.status(201).json({
            message: 'Category created successfully',
            category
        });
    }
    catch (error) {
        logger_1.default.error('Error creating category', {
            error: error instanceof Error ? error.message : 'Unknown error',
            adminId: req.user?.userId,
            body: req.body
        });
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.createCategory = createCategory;
const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { displayName, description, color, order, isActive } = req.body;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid category ID' });
        }
        const category = await Category_1.default.findById(id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        if (displayName)
            category.displayName = displayName;
        if (description)
            category.description = description;
        if (color)
            category.color = color;
        if (order !== undefined)
            category.order = order;
        if (isActive !== undefined)
            category.isActive = isActive;
        await category.save();
        logger_1.default.info('Category updated by admin', {
            adminId: req.user?.userId,
            categoryId: id,
            categoryKey: category.key,
            changes: req.body
        });
        res.json({
            message: 'Category updated successfully',
            category
        });
    }
    catch (error) {
        logger_1.default.error('Error updating category', {
            error: error instanceof Error ? error.message : 'Unknown error',
            adminId: req.user?.userId,
            categoryId: req.params.id,
            body: req.body
        });
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.updateCategory = updateCategory;
const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid category ID' });
        }
        const category = await Category_1.default.findById(id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        const articlesCount = await Article_1.default.countDocuments({ category: category.key });
        if (articlesCount > 0) {
            return res.status(400).json({
                message: `Cannot delete category. ${articlesCount} article(s) are using this category.`,
                articlesCount
            });
        }
        await Category_1.default.findByIdAndDelete(id);
        logger_1.default.info('Category deleted by admin', {
            adminId: req.user?.userId,
            deletedCategoryId: id,
            categoryKey: category.key,
            categoryName: category.displayName
        });
        res.json({ message: 'Category deleted successfully' });
    }
    catch (error) {
        logger_1.default.error('Error deleting category', {
            error: error instanceof Error ? error.message : 'Unknown error',
            adminId: req.user?.userId,
            categoryId: req.params.id
        });
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.deleteCategory = deleteCategory;
const getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid category ID' });
        }
        const category = await Category_1.default.findById(id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        const articlesCount = await Article_1.default.countDocuments({ category: category.key });
        logger_1.default.info('Category retrieved by admin', {
            adminId: req.user?.userId,
            categoryId: id,
            categoryKey: category.key
        });
        res.json({
            ...category.toObject(),
            articlesCount
        });
    }
    catch (error) {
        logger_1.default.error('Error fetching category', {
            error: error instanceof Error ? error.message : 'Unknown error',
            adminId: req.user?.userId,
            categoryId: req.params.id
        });
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getCategoryById = getCategoryById;
const getCategoryStats = async (req, res) => {
    try {
        const categories = await Category_1.default.find({ isActive: true });
        const stats = await Promise.all(categories.map(async (category) => {
            const articlesCount = await Article_1.default.countDocuments({ category: category.key });
            const publishedCount = await Article_1.default.countDocuments({
                category: category.key,
                status: 'published'
            });
            return {
                ...category.toObject(),
                articlesCount,
                publishedCount
            };
        }));
        logger_1.default.info('Category stats retrieved by admin', {
            adminId: req.user?.userId,
            categoriesCount: categories.length
        });
        res.json(stats);
    }
    catch (error) {
        logger_1.default.error('Error fetching category stats', {
            error: error instanceof Error ? error.message : 'Unknown error',
            adminId: req.user?.userId
        });
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getCategoryStats = getCategoryStats;
//# sourceMappingURL=categoryController.js.map