import mongoose, { Document } from 'mongoose';
export declare enum ArticleStatus {
    DRAFT = "draft",
    PUBLISHED = "published",
    ARCHIVED = "archived"
}
export interface IArticle extends Document {
    title: string;
    description: string;
    content: string;
    category: string;
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
declare const _default: mongoose.Model<IArticle, {}, {}, {}, mongoose.Document<unknown, {}, IArticle, {}, {}> & IArticle & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Article.d.ts.map