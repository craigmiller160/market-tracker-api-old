import { Express, NextFunction, Request, Response } from 'express';
import { logger } from '../logger';
import qs from 'qs';
import { format } from 'date-fns';
import { match, when } from 'ts-pattern';
import * as P from 'fp-ts/Predicate';
import { pipe } from 'fp-ts/function';

interface ErrorResponse {
	readonly timestamp: string;
	readonly status: number;
	readonly message: string;
	readonly request: string;
}

const isUnauthorizedError: P.Predicate<string> =
	pipe(
		(name: string) => name === 'JsonWebTokenError',
		P.or((name) => name === 'TokenExpiredError')
	)

// TODO need tests for this
const getErrorStatus = (err: Error): number =>
	match(err)
		.with({ name: when(isUnauthorizedError) }, () => 401)
		.otherwise(() => 500);

const getErrorMessage = (err: Error): string =>
	match(err)
		.with({ name: when(isUnauthorizedError) }, () => 'Unauthorized')
		.otherwise((_) => _.message);

const createErrorResponse = (
	err: Error,
	req: Request,
	status: number
): ErrorResponse => {
	const queryString = qs.stringify(req.query);
	const fullQueryString = queryString.length > 0 ? `?${queryString}` : '';

	const timestamp = format(new Date(), 'yyyy-MM-dd HH:mm:ss.SSS');

	return {
		timestamp,
		status,
		message: getErrorMessage(err),
		request: `${req.method} ${req.path}${fullQueryString}`
	};
};

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction): void => {
	logger.error('Error while processing request');
	logger.error(err);

	const status = getErrorStatus(err);
	const errorResponse = createErrorResponse(err, req, status);
	res.status(status);
	res.json(errorResponse);
	next();
}

export const setupErrorHandler = (app: Express) =>
	app.use((err: Error, req: Request, res: Response, next: NextFunction) =>
		errorHandler(err, req, res, next)
	);
