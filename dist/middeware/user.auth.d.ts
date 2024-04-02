import { Request, Response, NextFunction } from 'express';
declare const isLoggedIn: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export default isLoggedIn;
