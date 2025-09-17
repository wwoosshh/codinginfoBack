import { Request, Response, NextFunction } from 'express';
export interface AppError extends Error {
    statusCode: number;
    isOperational: boolean;
}
export declare const createError: (message: string, statusCode: number) => AppError;
export declare const handleAsync: (fn: Function) => (req: Request, res: Response, next: NextFunction) => void;
export declare const globalErrorHandler: (error: AppError, req: Request, res: Response, next: NextFunction) => void;
export declare const notFoundHandler: (req: Request, res: Response) => void;
//# sourceMappingURL=errorHandler.d.ts.map