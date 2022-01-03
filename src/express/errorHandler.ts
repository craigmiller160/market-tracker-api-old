import { Express, NextFunction, Request, Response } from 'express';
import { logger } from '../logger';
import qs from 'qs';

interface ErrorResponse {
	readonly status: number;
	readonly message: string;
	readonly request: string;
}

const getErrorStatus = (err: Error): number => 500;

const createErrorResponse = (
	err: Error,
	req: Request,
	status: number
): ErrorResponse => {
	const queryString = qs.stringify(req.query);
	const fullQueryString = queryString.length > 0 ? `?${queryString}` : '';

	return {
		status,
		message: err.message,
		request: `${req.method} ${req.path}${fullQueryString}`
	};
};

export const setupErrorHandler = (app: Express) =>
	app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
		logger.error('Error while processing request');
		logger.error(err);

		const status = getErrorStatus(err);
		const errorResponse = createErrorResponse(err, req, status);
		res.status(status);
		res.json(errorResponse);
		next();
	});
