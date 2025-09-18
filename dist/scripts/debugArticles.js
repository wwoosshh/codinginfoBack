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
exports.debugArticles = debugArticles;
const mongoose_1 = __importDefault(require("mongoose"));
const Article_1 = __importStar(require("../models/Article"));
const User_1 = __importDefault(require("../models/User"));
async function debugArticles() {
    try {
        console.log('🔍 Article Debug Information:');
        const dbState = mongoose_1.default.connection.readyState;
        console.log(`Database state: ${dbState} (1=connected, 0=disconnected)`);
        if (dbState !== 1) {
            console.log('❌ Database not connected');
            return { error: 'Database not connected' };
        }
        const totalCount = await Article_1.default.countDocuments({});
        console.log(`Total articles in DB: ${totalCount}`);
        const publishedCount = await Article_1.default.countDocuments({ status: Article_1.ArticleStatus.PUBLISHED });
        console.log(`Published articles: ${publishedCount}`);
        const draftCount = await Article_1.default.countDocuments({ status: Article_1.ArticleStatus.DRAFT });
        console.log(`Draft articles: ${draftCount}`);
        const noStatusCount = await Article_1.default.countDocuments({ status: { $exists: false } });
        console.log(`Articles without status field: ${noStatusCount}`);
        const noAuthorCount = await Article_1.default.countDocuments({ author: { $exists: false } });
        console.log(`Articles without author field: ${noAuthorCount}`);
        const sampleArticles = await Article_1.default.find({}).limit(5);
        console.log('\nSample articles:');
        sampleArticles.forEach((article, index) => {
            console.log(`${index + 1}. Title: ${article.title}`);
            console.log(`   Status: ${article.status || 'UNDEFINED'}`);
            console.log(`   Author: ${article.author || 'UNDEFINED'}`);
            console.log(`   CreatedAt: ${article.createdAt}`);
        });
        const userCount = await User_1.default.countDocuments({});
        console.log(`\nTotal users: ${userCount}`);
        return {
            totalArticles: totalCount,
            publishedArticles: publishedCount,
            draftArticles: draftCount,
            articlesWithoutStatus: noStatusCount,
            articlesWithoutAuthor: noAuthorCount,
            totalUsers: userCount,
            sampleArticles: sampleArticles.map(a => ({
                title: a.title,
                status: a.status,
                author: a.author,
                createdAt: a.createdAt
            }))
        };
    }
    catch (error) {
        console.error('Debug error:', error);
        return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
}
//# sourceMappingURL=debugArticles.js.map