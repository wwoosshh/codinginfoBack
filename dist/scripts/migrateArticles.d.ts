export declare function migrateArticles(): Promise<{
    success: boolean;
    totalArticles: number;
    publishedArticles: number;
    draftArticles: number;
    migratedStatus: number;
    migratedAuthor: number;
    migratedTags: number;
    migratedViewCount: number;
    adminUserId: unknown;
    error?: undefined;
} | {
    success: boolean;
    error: string;
    totalArticles?: undefined;
    publishedArticles?: undefined;
    draftArticles?: undefined;
    migratedStatus?: undefined;
    migratedAuthor?: undefined;
    migratedTags?: undefined;
    migratedViewCount?: undefined;
    adminUserId?: undefined;
}>;
//# sourceMappingURL=migrateArticles.d.ts.map