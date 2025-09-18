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
const mongoose_1 = __importDefault(require("mongoose"));
const Article_1 = __importStar(require("../models/Article"));
const User_1 = __importDefault(require("../models/User"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
async function checkDatabase() {
    try {
        await mongoose_1.default.connect(process.env.MONGODB_URI);
        console.log('✅ 데이터베이스 연결 성공');
        const allArticles = await Article_1.default.find({});
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
        const publishedArticles = await Article_1.default.find({ status: Article_1.ArticleStatus.PUBLISHED });
        console.log(`📊 Published 상태 아티클 수: ${publishedArticles.length}`);
        const allUsers = await User_1.default.find({});
        console.log(`👥 전체 사용자 수: ${allUsers.length}`);
        if (allUsers.length > 0) {
            console.log('\n👤 사용자 목록:');
            allUsers.forEach((user, index) => {
                console.log(`${index + 1}. ${user.username} (${user.email}) - Role: ${user.role}`);
            });
        }
        const articlesWithoutStatus = await Article_1.default.find({ status: { $exists: false } });
        const articlesWithoutAuthor = await Article_1.default.find({ author: { $exists: false } });
        console.log(`\n⚠️  status 필드가 없는 아티클: ${articlesWithoutStatus.length}개`);
        console.log(`⚠️  author 필드가 없는 아티클: ${articlesWithoutAuthor.length}개`);
        if (articlesWithoutStatus.length > 0 || articlesWithoutAuthor.length > 0) {
            console.log('\n🔧 데이터 마이그레이션이 필요합니다!');
        }
    }
    catch (error) {
        console.error('❌ 데이터베이스 확인 중 오류:', error);
    }
    finally {
        await mongoose_1.default.disconnect();
        console.log('\n✅ 데이터베이스 연결 해제');
    }
}
checkDatabase();
//# sourceMappingURL=checkDatabase.js.map