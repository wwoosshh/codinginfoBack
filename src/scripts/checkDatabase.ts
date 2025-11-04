import mongoose from 'mongoose';
import Article, { ArticleStatus } from '../models/Article';
import User from '../models/User';
import dotenv from 'dotenv';

dotenv.config();

async function checkDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('✅ 데이터베이스 연결 성공');

    // 전체 아티클 조회 (필터링 없이)
    const allArticles = await Article.find({});
    console.log(`\n📊 전체 아티클 수: ${allArticles.length}`);

    if (allArticles.length > 0) {
      console.log('\n📋 기존 아티클 상태:');
      allArticles.forEach((article, index) => {
        console.log(`${index + 1}. 제목: ${article.title}`);
        console.log(`   - status: ${article.status || 'undefined'}`);
        console.log(`   - author: ${article.author || 'undefined'}`);
        console.log(`   - _id: ${article._id}`);
        console.log(`   - createdAt: ${article.createdAt}`);
        console.log('');
      });
    }

    // Published 아티클만 조회
    const publishedArticles = await Article.find({ status: ArticleStatus.PUBLISHED });
    console.log(`📊 Published 상태 아티클 수: ${publishedArticles.length}`);

    // 전체 사용자 조회
    const allUsers = await User.find({});
    console.log(`👥 전체 사용자 수: ${allUsers.length}`);

    if (allUsers.length > 0) {
      console.log('\n👤 사용자 목록:');
      allUsers.forEach((user, index) => {
        console.log(`${index + 1}. ${user.username} (${user.email}) - Role: ${user.role}`);
      });
    }

    // 데이터 마이그레이션 필요한지 확인
    const articlesWithoutStatus = await Article.find({ status: { $exists: false } });
    const articlesWithoutAuthor = await Article.find({ author: { $exists: false } });

    console.log(`\n⚠️  status 필드가 없는 아티클: ${articlesWithoutStatus.length}개`);
    console.log(`⚠️  author 필드가 없는 아티클: ${articlesWithoutAuthor.length}개`);

    if (articlesWithoutStatus.length > 0 || articlesWithoutAuthor.length > 0) {
      console.log('\n🔧 데이터 마이그레이션이 필요합니다!');
    }

  } catch (error) {
    console.error('❌ 데이터베이스 확인 중 오류:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ 데이터베이스 연결 해제');
  }
}

checkDatabase();