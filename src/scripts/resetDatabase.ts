import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Article from '../models/Article';
import Category from '../models/Category';
import connectDB from '../config/database';

// Load environment variables
dotenv.config();

const resetDatabase = async () => {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    // 기존 아티클 모두 삭제
    const articlesDeleted = await Article.deleteMany({});
    console.log(`Deleted ${articlesDeleted.deletedCount} articles`);

    // 기존 카테고리 모두 삭제
    const categoriesDeleted = await Category.deleteMany({});
    console.log(`Deleted ${categoriesDeleted.deletedCount} categories`);

    console.log('Database reset completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error resetting database:', error);
    process.exit(1);
  }
};

resetDatabase();