"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Article_1 = __importDefault(require("../models/Article"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const cleanDatabase = async () => {
    try {
        console.log('🔄 Connecting to MongoDB...');
        await mongoose_1.default.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');
        const deleteResult = await Article_1.default.deleteMany({});
        console.log(`🗑️  Removed ${deleteResult.deletedCount} existing articles`);
        const testArticle = new Article_1.default({
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
            category: 'OVERFLOW',
            slug: 'db-integration-test',
            imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=400&fit=crop',
        });
        await testArticle.save();
        console.log('✅ Added test article');
        await mongoose_1.default.disconnect();
        console.log('✅ Database cleanup completed');
        console.log('\n🎉 Success! The database now contains only real data.');
        console.log('🔗 Check: https://codinginfoback-production.up.railway.app/api/articles');
    }
    catch (error) {
        console.error('❌ Error cleaning database:', error);
        process.exit(1);
    }
};
if (require.main === module) {
    cleanDatabase();
}
exports.default = cleanDatabase;
//# sourceMappingURL=cleanDatabase.js.map