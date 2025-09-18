import mongoose from 'mongoose';
import { ArticleStatus } from '../models/Article';
export declare function debugArticles(): Promise<{
    error: string;
    totalArticles?: undefined;
    publishedArticles?: undefined;
    draftArticles?: undefined;
    articlesWithoutStatus?: undefined;
    articlesWithoutAuthor?: undefined;
    totalUsers?: undefined;
    sampleArticles?: undefined;
} | {
    totalArticles: number;
    publishedArticles: number;
    draftArticles: number;
    articlesWithoutStatus: number;
    articlesWithoutAuthor: number;
    totalUsers: number;
    sampleArticles: {
        title: string;
        status: ArticleStatus;
        author: mongoose.Types.ObjectId;
        createdAt: Date;
    }[];
    error?: undefined;
}>;
//# sourceMappingURL=debugArticles.d.ts.map