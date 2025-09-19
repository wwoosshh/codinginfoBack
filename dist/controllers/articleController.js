"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteArticle = exports.updateArticle = exports.createArticle = exports.searchArticles = exports.getArticlesByCategory = exports.getArticleBySlug = exports.getAllArticles = void 0;
const Article_1 = __importStar(require("../models/Article"));
const Category_1 = __importDefault(require("../models/Category"));
const logger_1 = __importDefault(require("../utils/logger"));
const getAllArticles = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const search = req.query.search;
        const category = req.query.category;
        const tags = req.query.tags;
        let query = { status: Article_1.ArticleStatus.PUBLISHED };
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
            ];
        }
        if (category) {
            const categoryExists = await Category_1.default.findOne({ key: category.toUpperCase(), isActive: true });
            if (categoryExists) {
                query.category = category.toUpperCase();
            }
        }
        if (tags) {
            const tagArray = tags.split(',').map(tag => tag.trim());
            query.tags = { $in: tagArray };
        }
        const [articles, totalArticles, categories] = await Promise.all([
            Article_1.default.find(query)
                .populate('author', 'username')
                .sort({ publishedAt: -1, createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Article_1.default.countDocuments(query),
            Category_1.default.find({ isActive: true })
        ]);
        const categoryMap = new Map();
        categories.forEach(cat => {
            categoryMap.set(cat.key, {
                displayName: cat.displayName,
                color: cat.color
            });
        });
        const articlesWithCategory = articles.map(article => {
            const articleObj = article.toObject();
            const categoryInfo = categoryMap.get(articleObj.category);
            return {
                ...articleObj,
                categoryDisplayName: categoryInfo?.displayName || articleObj.category,
                categoryColor: categoryInfo?.color || '#6b7280'
            };
        });
        logger_1.default.info('Articles fetched', {
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
    }
    catch (error) {
        logger_1.default.error('Error fetching articles', {
            error: error instanceof Error ? error.message : 'Unknown error'
        });
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getAllArticles = getAllArticles;
const getArticleBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        const [article, category] = await Promise.all([
            Article_1.default.findOne({
                slug,
                status: Article_1.ArticleStatus.PUBLISHED
            }).populate('author', 'username'),
            Category_1.default.findOne({ key: slug.split('-')[0]?.toUpperCase(), isActive: true })
        ]);
        if (!article) {
            return res.status(404).json({ message: 'Article not found' });
        }
        const categoryInfo = await Category_1.default.findOne({ key: article.category, isActive: true });
        article.viewCount += 1;
        await article.save();
        const articleWithCategory = {
            ...article.toObject(),
            categoryDisplayName: categoryInfo?.displayName || article.category,
            categoryColor: categoryInfo?.color || '#6b7280'
        };
        logger_1.default.info('Article viewed', {
            articleId: article._id,
            slug: article.slug,
            viewCount: article.viewCount,
            title: article.title
        });
        res.json(articleWithCategory);
    }
    catch (error) {
        logger_1.default.error('Error fetching article by slug', {
            error: error instanceof Error ? error.message : 'Unknown error',
            slug: req.params.slug
        });
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getArticleBySlug = getArticleBySlug;
const getArticlesByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const categoryExists = await Category_1.default.findOne({ key: category.toUpperCase(), isActive: true });
        if (!categoryExists) {
            return res.status(400).json({ message: 'Invalid category' });
        }
        const [articles, totalArticles, categories] = await Promise.all([
            Article_1.default.find({
                category: category.toUpperCase(),
                status: Article_1.ArticleStatus.PUBLISHED
            })
                .populate('author', 'username')
                .sort({ publishedAt: -1, createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Article_1.default.countDocuments({
                category: category.toUpperCase(),
                status: Article_1.ArticleStatus.PUBLISHED
            }),
            Category_1.default.find({ isActive: true })
        ]);
        const categoryMap = new Map();
        categories.forEach(cat => {
            categoryMap.set(cat.key, {
                displayName: cat.displayName,
                color: cat.color
            });
        });
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
    }
    catch (error) {
        logger_1.default.error('Error fetching articles by category', {
            error: error instanceof Error ? error.message : 'Unknown error',
            category: req.params.category
        });
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getArticlesByCategory = getArticlesByCategory;
const searchArticles = async (req, res) => {
    try {
        const { keyword } = req.query;
        if (!keyword || typeof keyword !== 'string') {
            return res.status(400).json({ message: 'Keyword is required' });
        }
        const articles = await Article_1.default.find({
            $or: [
                { title: { $regex: keyword, $options: 'i' } },
                { description: { $regex: keyword, $options: 'i' } },
                { content: { $regex: keyword, $options: 'i' } },
            ],
        }).sort({ createdAt: -1 });
        res.json(articles);
    }
    catch (error) {
        console.error('Error searching articles:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.searchArticles = searchArticles;
const createArticle = async (req, res) => {
    try {
        const { title, description, content, category, slug, imageUrl, tags = [], status = Article_1.ArticleStatus.DRAFT } = req.body;
        if (!req.user?.userId) {
            return res.status(401).json({ message: 'Authentication required' });
        }
        const existingArticle = await Article_1.default.findOne({ slug });
        if (existingArticle) {
            return res.status(400).json({ message: 'Article with this slug already exists' });
        }
        const article = new Article_1.default({
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
        const populatedArticle = await Article_1.default.findById(article._id)
            .populate('author', 'username');
        logger_1.default.info('Article created', {
            articleId: article._id,
            authorId: req.user.userId,
            title: article.title,
            status: article.status,
            category: article.category
        });
        res.status(201).json(populatedArticle);
    }
    catch (error) {
        logger_1.default.error('Error creating article', {
            error: error instanceof Error ? error.message : 'Unknown error',
            authorId: req.user?.userId
        });
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: 'Validation error', error: error.message });
        }
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.createArticle = createArticle;
const updateArticle = async (req, res) => {
    try {
        const { slug } = req.params;
        const { title, description, content, category, imageUrl } = req.body;
        const article = await Article_1.default.findOneAndUpdate({ slug }, { title, description, content, category, imageUrl }, { new: true, runValidators: true });
        if (!article) {
            return res.status(404).json({ message: 'Article not found' });
        }
        res.json(article);
    }
    catch (error) {
        console.error('Error updating article:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: 'Validation error', error: error.message });
        }
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.updateArticle = updateArticle;
const deleteArticle = async (req, res) => {
    try {
        const { slug } = req.params;
        const article = await Article_1.default.findOneAndDelete({ slug });
        if (!article) {
            return res.status(404).json({ message: 'Article not found' });
        }
        res.status(204).send();
    }
    catch (error) {
        console.error('Error deleting article:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.deleteArticle = deleteArticle;
//# sourceMappingURL=articleController.js.map