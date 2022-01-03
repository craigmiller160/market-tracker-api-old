import { Express, NextFunction, Request, Response } from 'express';
import { logger } from '../logger';
import qs from 'qs';
import { format } from 'date-fns';

interface ErrorResponse {
	readonly timestamp: string;
	readonly status: number;
	readonly message: string;
	readonly request: string;
}

const getErrorStatus = (): number => 500;

const createErrorResponse = (
	err: Error,
	req: Request,
	status: number
): ErrorResponse => {
	const queryString = qs.stringify(req.query);
	const fullQueryString = queryString.length > 0 ? `?${queryString}` : ''

	const timestamp = format(new Date(), 'yyyy-MM-dd HH:mm:ss.SSS');

	return {
		timestamp,
		status,
		message: err.message,
		request: `${req.method} ${req.path}${fullQueryString}`
	};
};

export const setupErrorHandler = (app: Express) =>
	app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
		logger.error('Error while processing request');
		logger.error(err);

		const status = getErrorStatus();
		const errorResponse = createErrorResponse(err, req, status);
		res.status(status);
		res.json(errorResponse);
		next();
	});
