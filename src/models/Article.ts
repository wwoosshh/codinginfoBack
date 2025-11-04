import mongoose, { Document, Schema } from 'mongoose';

export enum ArticleStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

export interface IArticle extends Document {
  title: string;
  description: string;
  content: string;
  category: string; // 카테고리 키 (예: 'ALGORITHM', 'WEB_DEVELOPMENT')
  slug: string;
  status: ArticleStatus;
  author: mongoose.Types.ObjectId;
  imageUrl?: string;
  tags: string[];
  viewCount: number;
  publishedAt?: Date;
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
      trim: true,
      uppercase: true,
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      trim: true,
      maxlength: [100, 'Slug cannot be more than 100 characters'],
    },
    status: {
      type: String,
      enum: Object.values(ArticleStatus),
      default: ArticleStatus.DRAFT,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author is required'],
    },
    tags: [{
      type: String,
      trim: true,
      maxlength: [50, 'Tag cannot be more than 50 characters'],
    }],
    viewCount: {
      type: Number,
      default: 0,
    },
    publishedAt: {
      type: Date,
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
  if (this.isModified('status')) {
    if (this.status === ArticleStatus.PUBLISHED && !this.publishedAt) {
      this.publishedAt = new Date();
    }
  }

  next();
});

ArticleSchema.index({ title: 'text', description: 'text', content: 'text' });
ArticleSchema.index({ category: 1 });
ArticleSchema.index({ status: 1 });
ArticleSchema.index({ author: 1 });
ArticleSchema.index({ tags: 1 });
ArticleSchema.index({ createdAt: -1 });
ArticleSchema.index({ publishedAt: -1 });
ArticleSchema.index({ viewCount: -1 });

export default mongoose.model<IArticle>('Article', ArticleSchema);