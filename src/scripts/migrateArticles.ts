import mongoose from 'mongoose';
import Article, { ArticleStatus } from '../models/Article';
import User from '../models/User';

// 기존 아티클들을 새로운 스키마에 맞게 마이그레이션
export async function migrateArticles() {
  try {
    console.log('🔄 Starting article migration...');

    // 연결 상태 확인
    const dbState = mongoose.connection.readyState;
    if (dbState !== 1) {
      throw new Error('Database not connected');
    }

    // 관리자 사용자 찾기 (기본 author로 사용)
    let adminUser = await User.findOne({ role: 'admin' });

    // 관리자가 없으면 생성
    if (!adminUser) {
      console.log('⚠️  No admin user found, creating default admin...');
      adminUser = new User({
        username: 'admin',
        email: 'admin@codinginfo.com',
        password: 'admin123!', // 나중에 변경해야 함
        role: 'admin',
        isActive: true
      });
      await adminUser.save();
      console.log('✅ Default admin user created');
    }

    // status 필드가 없는 아티클들을 published로 설정
    const articlesWithoutStatus = await Article.find({ status: { $exists: false } });
    console.log(`Found ${articlesWithoutStatus.length} articles without status field`);

    for (const article of articlesWithoutStatus) {
      article.status = ArticleStatus.PUBLISHED;
      article.publishedAt = article.createdAt; // 생성일을 발행일로 설정
      await article.save();
    }

    // author 필드가 없는 아티클들에 관리자를 author로 설정
    const articlesWithoutAuthor = await Article.find({ author: { $exists: false } });
    console.log(`Found ${articlesWithoutAuthor.length} articles without author field`);

    for (const article of articlesWithoutAuthor) {
      article.author = adminUser._id as any;
      await article.save();
    }

    // tags 필드가 없는 아티클들에 빈 배열 설정
    const articlesWithoutTags = await Article.find({ tags: { $exists: false } });
    console.log(`Found ${articlesWithoutTags.length} articles without tags field`);

    for (const article of articlesWithoutTags) {
      article.tags = [];
      await article.save();
    }

    // viewCount 필드가 없는 아티클들에 0 설정
    const articlesWithoutViewCount = await Article.find({ viewCount: { $exists: false } });
    console.log(`Found ${articlesWithoutViewCount.length} articles without viewCount field`);

    for (const article of articlesWithoutViewCount) {
      article.viewCount = 0;
      await article.save();
    }

    // 마이그레이션 결과 확인
    const totalArticles = await Article.countDocuments({});
    const publishedArticles = await Article.countDocuments({ status: ArticleStatus.PUBLISHED });
    const draftArticles = await Article.countDocuments({ status: ArticleStatus.DRAFT });

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

  } catch (error) {
    console.error('❌ Migration failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}