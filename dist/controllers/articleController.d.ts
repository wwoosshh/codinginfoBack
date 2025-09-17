import { Request, Response } from 'express';
export declare const getAllArticles: (req: Request, res: Response) => Promise<void>;
export declare const getArticleBySlug: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getArticlesByCategory: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const searchArticles: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const createArticle: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateArticle: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteArticle: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=articleController.d.ts.map