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
exports.migrateArticles = migrateArticles;
const mongoose_1 = __importDefault(require("mongoose"));
const Article_1 = __importStar(require("../models/Article"));
const User_1 = __importDefault(require("../models/User"));
async function migrateArticles() {
    try {
        console.log('🔄 Starting article migration...');
        const dbState = mongoose_1.default.connection.readyState;
        if (dbState !== 1) {
            throw new Error('Database not connected');
        }
        let adminUser = await User_1.default.findOne({ role: 'admin' });
        if (!adminUser) {
            console.log('⚠️  No admin user found, creating default admin...');
            adminUser = new User_1.default({
                username: 'admin',
                email: 'admin@codinginfo.com',
                password: 'admin123!',
                role: 'admin',
                isActive: true
            });
            await adminUser.save();
            console.log('✅ Default admin user created');
        }
        const articlesWithoutStatus = await Article_1.default.find({ status: { $exists: false } });
        console.log(`Found ${articlesWithoutStatus.length} articles without status field`);
        for (const article of articlesWithoutStatus) {
            article.status = Article_1.ArticleStatus.PUBLISHED;
            article.publishedAt = article.createdAt;
            await article.save();
        }
        const articlesWithoutAuthor = await Article_1.default.find({ author: { $exists: false } });
        console.log(`Found ${articlesWithoutAuthor.length} articles without author field`);
        for (const article of articlesWithoutAuthor) {
            article.author = adminUser._id;
            await article.save();
        }
        const articlesWithoutTags = await Article_1.default.find({ tags: { $exists: false } });
        console.log(`Found ${articlesWithoutTags.length} articles without tags field`);
        for (const article of articlesWithoutTags) {
            article.tags = [];
            await article.save();
        }
        const articlesWithoutViewCount = await Article_1.default.find({ viewCount: { $exists: false } });
        console.log(`Found ${articlesWithoutViewCount.length} articles without viewCount field`);
        for (const article of articlesWithoutViewCount) {
            article.viewCount = 0;
            await article.save();
        }
        const totalArticles = await Article_1.default.countDocuments({});
        const publishedArticles = await Article_1.default.countDocuments({ status: Article_1.ArticleStatus.PUBLISHED });
        const draftArticles = await Article_1.default.countDocuments({ status: Article_1.ArticleStatus.DRAFT });
        console.log('\n✅ Migration completed!');
        console.log(`Total articles: ${totalArticles}`);
        console.log(`Published articles: ${publishedArticles}`);
        console.log(`Draft articles: ${draftArticles}`);
        return {
            success: true,
            totalArticles,
            publishedArticles,
            draftArticles,
            migratedStatus: articlesWithoutStatus.length,
            migratedAuthor: articlesWithoutAuthor.length,
            migratedTags: articlesWithoutTags.length,
            migratedViewCount: articlesWithoutViewCount.length,
            adminUserId: adminUser._id
        };
    }
    catch (error) {
        console.error('❌ Migration failed:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}
//# sourceMappingURL=migrateArticles.js.map