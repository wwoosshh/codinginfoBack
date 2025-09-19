"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runMigration = runMigration;
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const Category_1 = __importDefault(require("../models/Category"));
const Article_1 = __importDefault(require("../models/Article"));
const logger_1 = __importDefault(require("../utils/logger"));
dotenv_1.default.config();
const LEGACY_CATEGORIES = {
    OVERFLOW: {
        key: 'OVERFLOW',
        displayName: '오버플로우',
        description: '데이터 타입의 범위를 벗어나는 현상들',
        color: '#ef4444',
    },
    GAME_DEVELOPMENT: {
        key: 'GAME_DEVELOPMENT',
        displayName: '게임 개발',
        description: '게임 프로그래밍의 흥미로운 현상들',
        color: '#8b5cf6',
    },
    GRAPHICS: {
        key: 'GRAPHICS',
        displayName: '그래픽스',
        description: '컴퓨터 그래픽스의 원리와 기법',
        color: '#06b6d4',
    },
    ALGORITHM: {
        key: 'ALGORITHM',
        displayName: '알고리즘',
        description: '효율적인 문제 해결 방법들',
        color: '#10b981',
    },
    WEB_DEVELOPMENT: {
        key: 'WEB_DEVELOPMENT',
        displayName: '웹 개발',
        description: '웹 기술의 동작 원리',
        color: '#f59e0b',
    },
    DATA_STRUCTURE: {
        key: 'DATA_STRUCTURE',
        displayName: '자료구조',
        description: '데이터를 효율적으로 저장하고 조작하는 방법',
        color: '#ec4899',
    },
};
async function connectDatabase() {
    try {
        const mongoUri = process.env.MONGODB_URI;
        if (!mongoUri) {
            throw new Error('MONGODB_URI environment variable is not set');
        }
        console.log('Connecting to MongoDB Atlas...');
        await mongoose_1.default.connect(mongoUri);
        logger_1.default.info('Database connected for migration');
    }
    catch (error) {
        logger_1.default.error('Database connection failed', { error });
        throw error;
    }
}
async function createCategories() {
    try {
        logger_1.default.info('Starting category creation...');
        await Category_1.default.deleteMany({});
        logger_1.default.info('Existing categories cleared');
        const categories = Object.values(LEGACY_CATEGORIES).map((cat, index) => ({
            ...cat,
            order: index,
            isActive: true
        }));
        const createdCategories = await Category_1.default.insertMany(categories);
        logger_1.default.info('Categories created', {
            count: createdCategories.length,
            categories: createdCategories.map(c => ({ key: c.key, displayName: c.displayName }))
        });
        return createdCategories;
    }
    catch (error) {
        logger_1.default.error('Error creating categories', { error });
        throw error;
    }
}
async function updateArticles() {
    try {
        logger_1.default.info('Starting article category migration...');
        const articles = await Article_1.default.find({});
        logger_1.default.info(`Found ${articles.length} articles to migrate`);
        let updatedCount = 0;
        for (const article of articles) {
            const oldCategory = article.category;
            if (LEGACY_CATEGORIES[oldCategory]) {
                logger_1.default.info(`Article ${article._id} already has correct category: ${oldCategory}`);
                continue;
            }
            let newCategory = oldCategory.toUpperCase();
            if (newCategory === 'GAME_DEV')
                newCategory = 'GAME_DEVELOPMENT';
            if (newCategory === 'WEB_DEV')
                newCategory = 'WEB_DEVELOPMENT';
            if (newCategory === 'DATA_STRUCT')
                newCategory = 'DATA_STRUCTURE';
            if (!LEGACY_CATEGORIES[newCategory]) {
                logger_1.default.warn(`Invalid category found: ${oldCategory} for article ${article._id}. Setting to ALGORITHM.`);
                newCategory = 'ALGORITHM';
            }
            await Article_1.default.findByIdAndUpdate(article._id, {
                category: newCategory
            });
            updatedCount++;
            logger_1.default.info(`Updated article ${article._id}: ${oldCategory} -> ${newCategory}`);
        }
        logger_1.default.info(`Migration completed. Updated ${updatedCount} articles.`);
        return updatedCount;
    }
    catch (error) {
        logger_1.default.error('Error updating articles', { error });
        throw error;
    }
}
async function verifyMigration() {
    try {
        logger_1.default.info('Verifying migration...');
        const [categories, articles] = await Promise.all([
            Category_1.default.find({ isActive: true }),
            Article_1.default.find({})
        ]);
        logger_1.default.info(`Verification results:`);
        logger_1.default.info(`- Categories: ${categories.length}`);
        logger_1.default.info(`- Articles: ${articles.length}`);
        const categoryKeys = categories.map(c => c.key);
        for (const key of categoryKeys) {
            const count = await Article_1.default.countDocuments({ category: key });
            logger_1.default.info(`- ${key}: ${count} articles`);
        }
        const invalidArticles = await Article_1.default.find({
            category: { $nin: categoryKeys }
        });
        if (invalidArticles.length > 0) {
            logger_1.default.warn(`Found ${invalidArticles.length} articles with invalid categories:`);
            invalidArticles.forEach(article => {
                logger_1.default.warn(`- Article ${article._id}: ${article.category}`);
            });
        }
        else {
            logger_1.default.info('All articles have valid categories!');
        }
        return {
            categories: categories.length,
            articles: articles.length,
            invalidArticles: invalidArticles.length
        };
    }
    catch (error) {
        logger_1.default.error('Error during verification', { error });
        throw error;
    }
}
async function runMigration() {
    try {
        logger_1.default.info('Starting category migration script...');
        await connectDatabase();
        await createCategories();
        await updateArticles();
        await verifyMigration();
        logger_1.default.info('Migration completed successfully!');
    }
    catch (error) {
        logger_1.default.error('Migration failed', { error });
        throw error;
    }
    finally {
        await mongoose_1.default.disconnect();
        logger_1.default.info('Database disconnected');
    }
}
if (require.main === module) {
    runMigration().catch(error => {
        console.error('Migration script failed:', error);
        process.exit(1);
    });
}
//# sourceMappingURL=migrateCategories.js.map