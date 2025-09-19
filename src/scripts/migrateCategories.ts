import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Category from '../models/Category';
import Article from '../models/Article';
import logger from '../utils/logger';

// .env 파일 로드
dotenv.config();

// 기존 하드코딩된 카테고리 정의
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
    await mongoose.connect(mongoUri);
    logger.info('Database connected for migration');
  } catch (error) {
    logger.error('Database connection failed', { error });
    throw error;
  }
}

async function createCategories() {
  try {
    logger.info('Starting category creation...');

    // 기존 카테고리 삭제 (초기화)
    await Category.deleteMany({});
    logger.info('Existing categories cleared');

    // 새 카테고리들 생성
    const categories = Object.values(LEGACY_CATEGORIES).map((cat, index) => ({
      ...cat,
      order: index,
      isActive: true
    }));

    const createdCategories = await Category.insertMany(categories);
    logger.info('Categories created', {
      count: createdCategories.length,
      categories: createdCategories.map(c => ({ key: c.key, displayName: c.displayName }))
    });

    return createdCategories;
  } catch (error) {
    logger.error('Error creating categories', { error });
    throw error;
  }
}

async function updateArticles() {
  try {
    logger.info('Starting article category migration...');

    // 모든 아티클 조회
    const articles = await Article.find({});
    logger.info(`Found ${articles.length} articles to migrate`);

    let updatedCount = 0;

    for (const article of articles) {
      const oldCategory = article.category;

      // 기존 enum 값이 새로운 시스템의 키와 일치하는지 확인
      if (LEGACY_CATEGORIES[oldCategory as keyof typeof LEGACY_CATEGORIES]) {
        // 이미 올바른 형식이므로 업데이트 불필요
        logger.info(`Article ${article._id} already has correct category: ${oldCategory}`);
        continue;
      }

      // 카테고리 형식이 다른 경우 수정
      let newCategory = oldCategory.toUpperCase();

      // 일부 변환 로직 (필요시)
      if (newCategory === 'GAME_DEV') newCategory = 'GAME_DEVELOPMENT';
      if (newCategory === 'WEB_DEV') newCategory = 'WEB_DEVELOPMENT';
      if (newCategory === 'DATA_STRUCT') newCategory = 'DATA_STRUCTURE';

      // 유효한 카테고리인지 확인
      if (!LEGACY_CATEGORIES[newCategory as keyof typeof LEGACY_CATEGORIES]) {
        logger.warn(`Invalid category found: ${oldCategory} for article ${article._id}. Setting to ALGORITHM.`);
        newCategory = 'ALGORITHM';
      }

      // 아티클 업데이트
      await Article.findByIdAndUpdate(article._id, {
        category: newCategory
      });

      updatedCount++;
      logger.info(`Updated article ${article._id}: ${oldCategory} -> ${newCategory}`);
    }

    logger.info(`Migration completed. Updated ${updatedCount} articles.`);
    return updatedCount;
  } catch (error) {
    logger.error('Error updating articles', { error });
    throw error;
  }
}

async function verifyMigration() {
  try {
    logger.info('Verifying migration...');

    const [categories, articles] = await Promise.all([
      Category.find({ isActive: true }),
      Article.find({})
    ]);

    logger.info(`Verification results:`);
    logger.info(`- Categories: ${categories.length}`);
    logger.info(`- Articles: ${articles.length}`);

    // 카테고리별 아티클 수 확인
    const categoryKeys = categories.map(c => c.key);
    for (const key of categoryKeys) {
      const count = await Article.countDocuments({ category: key });
      logger.info(`- ${key}: ${count} articles`);
    }

    // 잘못된 카테고리를 가진 아티클 확인
    const invalidArticles = await Article.find({
      category: { $nin: categoryKeys }
    });

    if (invalidArticles.length > 0) {
      logger.warn(`Found ${invalidArticles.length} articles with invalid categories:`);
      invalidArticles.forEach(article => {
        logger.warn(`- Article ${article._id}: ${article.category}`);
      });
    } else {
      logger.info('All articles have valid categories!');
    }

    return {
      categories: categories.length,
      articles: articles.length,
      invalidArticles: invalidArticles.length
    };
  } catch (error) {
    logger.error('Error during verification', { error });
    throw error;
  }
}

async function runMigration() {
  try {
    logger.info('Starting category migration script...');

    await connectDatabase();

    // 1. 카테고리 생성
    await createCategories();

    // 2. 아티클 업데이트
    await updateArticles();

    // 3. 검증
    await verifyMigration();

    logger.info('Migration completed successfully!');
  } catch (error) {
    logger.error('Migration failed', { error });
    throw error;
  } finally {
    await mongoose.disconnect();
    logger.info('Database disconnected');
  }
}

// 스크립트 실행
if (require.main === module) {
  runMigration().catch(error => {
    console.error('Migration script failed:', error);
    process.exit(1);
  });
}

export { runMigration };