import mongoose, { Document, Schema } from 'mongoose';

export interface ICategory extends Document {
  key: string;
  displayName: string;
  description: string;
  color: string;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema: Schema = new Schema(
  {
    key: {
      type: String,
      required: [true, 'Category key is required'],
      uppercase: true,
      trim: true,
      maxlength: [50, 'Category key cannot be more than 50 characters'],
      match: [/^[A-Z_]+$/, 'Category key can only contain uppercase letters and underscores']
    },
    displayName: {
      type: String,
      required: [true, 'Display name is required'],
      trim: true,
      maxlength: [100, 'Display name cannot be more than 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [500, 'Description cannot be more than 500 characters'],
    },
    color: {
      type: String,
      required: [true, 'Color is required'],
      match: [/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex color code'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
CategorySchema.index({ key: 1 }, { unique: true });
CategorySchema.index({ isActive: 1 });
CategorySchema.index({ order: 1 });

export default mongoose.model<ICategory>('Category', CategorySchema);