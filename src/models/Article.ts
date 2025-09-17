import mongoose, { Document, Schema } from 'mongoose';

export enum Category {
  OVERFLOW = 'OVERFLOW',
  GAME_DEVELOPMENT = 'GAME_DEVELOPMENT',
  GRAPHICS = 'GRAPHICS',
  ALGORITHM = 'ALGORITHM',
  WEB_DEVELOPMENT = 'WEB_DEVELOPMENT',
  DATA_STRUCTURE = 'DATA_STRUCTURE',
}

export const CategoryDisplayNames = {
  [Category.OVERFLOW]: '오버플로우',
  [Category.GAME_DEVELOPMENT]: '게임 개발',
  [Category.GRAPHICS]: '그래픽스',
  [Category.ALGORITHM]: '알고리즘',
  [Category.WEB_DEVELOPMENT]: '웹 개발',
  [Category.DATA_STRUCTURE]: '자료구조',
};

export interface IArticle extends Document {
  title: string;
  description: string;
  content: string;
  category: Category;
  categoryDisplayName: string;
  slug: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ArticleSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot be more than 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [500, 'Description cannot be more than 500 characters'],
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: Object.values(Category),
    },
    categoryDisplayName: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      trim: true,
      maxlength: [100, 'Slug cannot be more than 100 characters'],
    },
    imageUrl: {
      type: String,
      trim: true,
      maxlength: [500, 'Image URL cannot be more than 500 characters'],
    },
  },
  {
    timestamps: true,
  }
);

ArticleSchema.pre('save', function (next) {
  if (this.isModified('category')) {
    this.categoryDisplayName = CategoryDisplayNames[this.category as Category];
  }
  next();
});

ArticleSchema.index({ title: 'text', description: 'text', content: 'text' });
ArticleSchema.index({ category: 1 });
ArticleSchema.index({ createdAt: -1 });

export default mongoose.model<IArticle>('Article', ArticleSchema);