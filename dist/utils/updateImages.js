"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Article_1 = __importDefault(require("../models/Article"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const updateImages = async () => {
    try {
        await mongoose_1.default.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/coding-info');
        console.log('Connected to MongoDB');
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
            const result = await Article_1.default.updateOne({ slug: update.slug }, { $set: { imageUrl: update.imageUrl } });
            console.log(`Updated ${update.slug}: ${result.modifiedCount} documents modified`);
        }
        console.log('✅ All image URLs updated successfully');
        await mongoose_1.default.disconnect();
    }
    catch (error) {
        console.error('❌ Error updating images:', error);
        await mongoose_1.default.disconnect();
    }
};
updateImages();
//# sourceMappingURL=updateImages.js.map