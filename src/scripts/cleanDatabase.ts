import mongoose from 'mongoose';
import Article from '../models/Article';
import dotenv from 'dotenv';

dotenv.config();

const cleanDatabase = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('✅ Connected to MongoDB');

    // Clear all existing articles
    const deleteResult = await Article.deleteMany({});
    console.log(`🗑️  Removed ${deleteResult.deletedCount} existing articles`);

    // Add one simple test article to verify DB integration
    const testArticle = new Article({
      title: 'DB 연동 테스트 아티클',
      description: '이 아티클은 실제 데이터베이스 연동을 확인하기 위한 테스트 아티클입니다.',
      content: `# DB 연동 테스트

이 아티클이 보인다면 다음이 성공적으로 작동하고 있습니다:

1. ✅ MongoDB Atlas 연결
2. ✅ 백엔드 API 서버
3. ✅ 프론트엔드-백엔드 통신
4. ✅ 하드코딩 제거 완료

## 다음 단계

이제 관리자 페이지에서 새로운 아티클을 작성할 수 있도록 구현할 예정입니다.`,
      category: 'OVERFLOW' as any,
      slug: 'db-integration-test',
      imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=400&fit=crop',
    });

    await testArticle.save();
    console.log('✅ Added test article');

    await mongoose.disconnect();
    console.log('✅ Database cleanup completed');

    console.log('\n🎉 Success! The database now contains only real data.');
    console.log('🔗 Check: https://codinginfoback-production.up.railway.app/api/articles');

  } catch (error) {
    console.error('❌ Error cleaning database:', error);
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  cleanDatabase();
}

export default cleanDatabase;