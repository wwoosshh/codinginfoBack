import { Request, Response } from 'express';
export declare const getDashboardStats: (req: Request, res: Response) => Promise<void>;
export declare const getAllUsers: (req: Request, res: Response) => Promise<void>;
export declare const updateUserStatus: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteUser: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getAllArticlesAdmin: (req: Request, res: Response) => Promise<void>;
export declare const updateArticleStatus: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteArticleAdmin: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const createArticle: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateArticle: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getArticleById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getSystemHealth: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=adminController.d.ts.map