import { Express, NextFunction, Request, Response } from 'express';

export const setupErrorHandler = (app: Express) =>
	app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
		res.status(500);
		res.send(err.message);
		next();
	});
