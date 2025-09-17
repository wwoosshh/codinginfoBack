import winston from 'winston';
declare const logger: winston.Logger;
export declare const requestLogger: (req: any, res: any, next: any) => void;
export declare const dbLogger: {
    query: (operation: string, collection: string, query: any) => void;
    error: (operation: string, collection: string, error: Error) => void;
};
export declare const authLogger: {
    login: (userId: string, ip: string, success: boolean) => void;
    register: (userId: string, ip: string) => void;
    logout: (userId: string, ip: string) => void;
};
export declare const perfLogger: {
    start: (operation: string) => {
        end: () => void;
    };
};
export default logger;
//# sourceMappingURL=logger.d.ts.map