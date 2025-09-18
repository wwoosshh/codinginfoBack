import mongoose, { Document } from 'mongoose';
export declare enum Category {
    OVERFLOW = "OVERFLOW",
    GAME_DEVELOPMENT = "GAME_DEVELOPMENT",
    GRAPHICS = "GRAPHICS",
    ALGORITHM = "ALGORITHM",
    WEB_DEVELOPMENT = "WEB_DEVELOPMENT",
    DATA_STRUCTURE = "DATA_STRUCTURE"
}
export declare const CategoryDisplayNames: {
    OVERFLOW: string;
    GAME_DEVELOPMENT: string;
    GRAPHICS: string;
    ALGORITHM: string;
    WEB_DEVELOPMENT: string;
    DATA_STRUCTURE: string;
};
export declare enum ArticleStatus {
    DRAFT = "draft",
    PUBLISHED = "published",
    ARCHIVED = "archived"
}
export interface IArticle extends Document {
    title: string;
    description: string;
    content: string;
    category: Category;
    categoryDisplayName: string;
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