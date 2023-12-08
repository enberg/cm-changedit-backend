declare global {
    namespace Express {
        export interface Request {
            userId?: string;
        }
    }
}

export {};