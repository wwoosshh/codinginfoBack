import mongoose from 'mongoose';
import Article, { ArticleStatus } from '../models/Article';
import User from '../models/User';

// Railway 프로덕션에서 실행될 간단한 디버그 스크립트
export async function debugArticles() {
  try {
    console.log('🔍 Article Debug Information:');

    // 연결 상태 확인
    const dbState = mongoose.connection.readyState;
    console.log(`Database state: ${dbState} (1=connected, 0=disconnected)`);

    if (dbState !== 1) {
      console.log('❌ Database not connected');
      return { error: 'Database not connected' };
    }

    // 전체 아티클 수 (필터링 없이)
    const totalCount = await Article.countDocuments({});
    console.log(`Total articles in DB: ${totalCount}`);

    // Published 아티클 수
    const publishedCount = await Article.countDocuments({ status: ArticleStatus.PUBLISHED });
    console.log(`Published articles: ${publishedCount}`);

    // Draft 아티클 수
    const draftCount = await Article.countDocuments({ status: ArticleStatus.DRAFT });
    console.log(`Draft articles: ${draftCount}`);

    // status 필드가 없는 아티클
    const noStatusCount = await Article.countDocuments({ status: { $exists: false } });
    console.log(`Articles without status field: ${noStatusCount}`);

    // author 필드가 없는 아티클
    const noAuthorCount = await Article.countDocuments({ author: { $exists: false } });
    console.log(`Articles without author field: ${noAuthorCount}`);

    // 실제 아티클 조회 (최대 5개)
    const sampleArticles = await Article.find({}).limit(5);
    console.log('\nSample articles:');
    sampleArticles.forEach((article, index) => {
      console.log(`${index + 1}. Title: ${article.title}`);
      console.log(`   Status: ${article.status || 'UNDEFINED'}`);
      console.log(`   Author: ${article.author || 'UNDEFINED'}`);
      console.log(`   CreatedAt: ${article.createdAt}`);
    });

    // 사용자 수
    const userCount = await User.countDocuments({});
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

  } catch (error) {
    console.error('Debug error:', error);
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
}