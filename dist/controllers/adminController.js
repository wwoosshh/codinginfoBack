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
exports.getSystemHealth = exports.deleteArticleAdmin = exports.updateArticleStatus = exports.getAllArticlesAdmin = exports.deleteUser = exports.updateUserStatus = exports.getAllUsers = exports.getDashboardStats = void 0;
const Article_1 = __importStar(require("../models/Article"));
const User_1 = __importDefault(require("../models/User"));
const logger_1 = __importDefault(require("../utils/logger"));
const mongoose_1 = __importDefault(require("mongoose"));
const getDashboardStats = async (req, res) => {
    try {
        logger_1.default.info('Admin dashboard stats requested', {
            adminId: req.user?.userId,
            timestamp: new Date().toISOString()
        });
        const [totalArticles, publishedArticles, draftArticles, totalUsers, activeUsers, totalViews,] = await Promise.all([
            Article_1.default.countDocuments(),
            Article_1.default.countDocuments({ status: Article_1.ArticleStatus.PUBLISHED }),
            Article_1.default.countDocuments({ status: Article_1.ArticleStatus.DRAFT }),
            User_1.default.countDocuments(),
            User_1.default.countDocuments({ isActive: true }),
            Article_1.default.aggregate([
                { $group: { _id: null, totalViews: { $sum: '$viewCount' } } }
            ]),
        ]);
        const recentArticles = await Article_1.default.find()
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
        logger_1.default.info('Dashboard stats retrieved successfully', {
            adminId: req.user?.userId,
            stats: {
                totalArticles,
                totalUsers,
                totalViews: totalViews[0]?.totalViews || 0
            }
        });
        res.json(stats);
    }
    catch (error) {
        logger_1.default.error('Error fetching dashboard stats', {
            error: error instanceof Error ? error.message : 'Unknown error',
            adminId: req.user?.userId
        });
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getDashboardStats = getDashboardStats;
const getAllUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const search = req.query.search;
        const role = req.query.role;
        const status = req.query.status;
        let query = {};
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
        }
        else if (status === 'inactive') {
            query.isActive = false;
        }
        const [users, totalUsers] = await Promise.all([
            User_1.default.find(query)
                .select('-password')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            User_1.default.countDocuments(query),
        ]);
        logger_1.default.info('Users list retrieved', {
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
    }
    catch (error) {
        logger_1.default.error('Error fetching users', {
            error: error instanceof Error ? error.message : 'Unknown error',
            adminId: req.user?.userId
        });
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getAllUsers = getAllUsers;
const updateUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid user ID' });
        }
        if (typeof isActive !== 'boolean') {
            return res.status(400).json({ message: 'isActive must be a boolean' });
        }
        const user = await User_1.default.findById(id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (user.role === 'admin' && !isActive) {
            return res.status(400).json({ message: 'Cannot deactivate admin users' });
        }
        user.isActive = isActive;
        await user.save();
        logger_1.default.info('User status updated', {
            adminId: req.user?.userId,
            targetUserId: id,
            newStatus: isActive,
            targetUsername: user.username
        });
        res.json({
            message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
            user: user
        });
    }
    catch (error) {
        logger_1.default.error('Error updating user status', {
            error: error instanceof Error ? error.message : 'Unknown error',
            adminId: req.user?.userId,
            targetUserId: req.params.id
        });
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.updateUserStatus = updateUserStatus;
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid user ID' });
        }
        const user = await User_1.default.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (user.role === 'admin') {
            return res.status(400).json({ message: 'Cannot delete admin users' });
        }
        if (req.user?.userId === id) {
            return res.status(400).json({ message: 'Cannot delete your own account' });
        }
        await Article_1.default.updateMany({ author: id }, { status: Article_1.ArticleStatus.ARCHIVED });
        await User_1.default.findByIdAndDelete(id);
        logger_1.default.info('User deleted', {
            adminId: req.user?.userId,
            deletedUserId: id,
            deletedUsername: user.username
        });
        res.json({ message: 'User deleted successfully' });
    }
    catch (error) {
        logger_1.default.error('Error deleting user', {
            error: error instanceof Error ? error.message : 'Unknown error',
            adminId: req.user?.userId,
            targetUserId: req.params.id
        });
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.deleteUser = deleteUser;
const getAllArticlesAdmin = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const search = req.query.search;
        const category = req.query.category;
        const status = req.query.status;
        const author = req.query.author;
        let query = {};
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }
        if (category) {
            query.category = category;
        }
        if (status && Object.values(Article_1.ArticleStatus).includes(status)) {
            query.status = status;
        }
        if (author && mongoose_1.default.Types.ObjectId.isValid(author)) {
            query.author = author;
        }
        const [articles, totalArticles] = await Promise.all([
            Article_1.default.find(query)
                .populate('author', 'username email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Article_1.default.countDocuments(query),
        ]);
        logger_1.default.info('Admin articles list retrieved', {
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
    }
    catch (error) {
        logger_1.default.error('Error fetching admin articles', {
            error: error instanceof Error ? error.message : 'Unknown error',
            adminId: req.user?.userId
        });
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getAllArticlesAdmin = getAllArticlesAdmin;
const updateArticleStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid article ID' });
        }
        if (!Object.values(Article_1.ArticleStatus).includes(status)) {
            return res.status(400).json({
                message: 'Invalid status',
                validStatuses: Object.values(Article_1.ArticleStatus)
            });
        }
        const article = await Article_1.default.findById(id).populate('author', 'username');
        if (!article) {
            return res.status(404).json({ message: 'Article not found' });
        }
        const oldStatus = article.status;
        article.status = status;
        await article.save();
        logger_1.default.info('Article status updated', {
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
    }
    catch (error) {
        logger_1.default.error('Error updating article status', {
            error: error instanceof Error ? error.message : 'Unknown error',
            adminId: req.user?.userId,
            articleId: req.params.id
        });
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.updateArticleStatus = updateArticleStatus;
const deleteArticleAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid article ID' });
        }
        const article = await Article_1.default.findById(id).populate('author', 'username');
        if (!article) {
            return res.status(404).json({ message: 'Article not found' });
        }
        await Article_1.default.findByIdAndDelete(id);
        logger_1.default.info('Article deleted by admin', {
            adminId: req.user?.userId,
            deletedArticleId: id,
            articleTitle: article.title,
            originalAuthor: article.author
        });
        res.json({ message: 'Article deleted successfully' });
    }
    catch (error) {
        logger_1.default.error('Error deleting article', {
            error: error instanceof Error ? error.message : 'Unknown error',
            adminId: req.user?.userId,
            articleId: req.params.id
        });
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.deleteArticleAdmin = deleteArticleAdmin;
const getSystemHealth = async (req, res) => {
    try {
        const dbState = mongoose_1.default.connection.readyState;
        const dbStateMap = {
            0: 'disconnected',
            1: 'connected',
            2: 'connecting',
            3: 'disconnecting',
        };
        const [articleCount, userCount] = await Promise.all([
            Article_1.default.countDocuments(),
            User_1.default.countDocuments(),
        ]);
        const health = {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            database: {
                status: dbStateMap[dbState],
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
        logger_1.default.info('System health check performed', {
            adminId: req.user?.userId,
            health: {
                dbStatus: health.database.status,
                uptime: health.uptime,
                articleCount,
                userCount
            }
        });
        res.json(health);
    }
    catch (error) {
        logger_1.default.error('Error checking system health', {
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
exports.getSystemHealth = getSystemHealth;
//# sourceMappingURL=adminController.js.map