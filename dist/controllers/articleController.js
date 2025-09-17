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
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteArticle = exports.updateArticle = exports.createArticle = exports.searchArticles = exports.getArticlesByCategory = exports.getArticleBySlug = exports.getAllArticles = void 0;
const Article_1 = __importStar(require("../models/Article"));
const getAllArticles = async (req, res) => {
    try {
        const articles = await Article_1.default.find().sort({ createdAt: -1 });
        res.json(articles);
    }
    catch (error) {
        console.error('Error fetching articles:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getAllArticles = getAllArticles;
const getArticleBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        const article = await Article_1.default.findOne({ slug });
        if (!article) {
            return res.status(404).json({ message: 'Article not found' });
        }
        res.json(article);
    }
    catch (error) {
        console.error('Error fetching article by slug:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getArticleBySlug = getArticleBySlug;
const getArticlesByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        if (!Object.values(Article_1.Category).includes(category)) {
            return res.status(400).json({ message: 'Invalid category' });
        }
        const articles = await Article_1.default.find({ category }).sort({ createdAt: -1 });
        res.json(articles);
    }
    catch (error) {
        console.error('Error fetching articles by category:', error);
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
        const { title, description, content, category, slug, imageUrl } = req.body;
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
        });
        await article.save();
        res.status(201).json(article);
    }
    catch (error) {
        console.error('Error creating article:', error);
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