import mongoose from 'mongoose';
import Article from '../models/Article';
import dotenv from 'dotenv';

dotenv.config();

const updateImages = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/coding-info');
    console.log('Connected to MongoDB');

    // Update image URLs for existing articles
    const updates = [
      {
        slug: 'why-does-overflow-happen',
        imageUrl: 'https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?w=800&h=400&fit=crop'
      },
      {
        slug: 'why-bunny-hopping-appears-in-games',
        imageUrl: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&h=400&fit=crop'
      },
      {
        slug: 'how-anti-aliasing-works',
        imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=400&fit=crop'
      }
    ];

    for (const update of updates) {
      const result = await Article.updateOne(
        { slug: update.slug },
        { $set: { imageUrl: update.imageUrl } }
      );
      console.log(`Updated ${update.slug}: ${result.modifiedCount} documents modified`);
    }

    console.log('✅ All image URLs updated successfully');
    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error updating images:', error);
    await mongoose.disconnect();
  }
};

updateImages();