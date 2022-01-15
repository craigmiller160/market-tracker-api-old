import {
	Strategy as JwtStrategy,
	ExtractJwt,
	StrategyOptions
} from 'passport-jwt';
import { TokenKey } from '../auth/TokenKey';
import passport from 'passport';
import { logger } from '../logger';
import { NextFunction, Request, Response } from 'express';
import { errorHandler } from './errorHandler';
import { pipe } from 'fp-ts/function';
import * as O from 'fp-ts/Option';
import * as E from 'fp-ts/Either';

export interface AccessToken {
	readonly sub: string;
	readonly clientName: string;
	readonly firstName: string;
	readonly lastName: string;
	readonly userId: number;
	readonly userEmail: string;
	readonly roles: string[];
}

type Route = (req: Request, res: Response, next: NextFunction) => void;

const secureCallback =
	(req: Request, res: Response, next: NextFunction, fn: Route) =>
	(
		error: Error | null,
		user: AccessToken | boolean,
		tokenError: Error | undefined
	) => {
		pipe(
			O.fromNullable(error),
			O.getOrElse(() => tokenError),
			O.fromNullable,
			O.fold(
				() => {
					req.user = user as AccessToken;
					fn(req, res, next);
				},
				(realError) => errorHandler(realError, req, res, next)
			)
		);
	};

export const secure =
	(fn: Route): Route =>
	(req, res, next) => {
		passport.authenticate(
			'jwt',
			{ session: false },
			secureCallback(req, res, next, fn)
		)(req, res, next);
	};

const getJwtFromCookie = (req: Request) => {
	pipe(
		O.fromNullable(process.env.COOKIE_NAME),
		O.map((cookieName) => {
			const regex = `^${cookieName}=(?<token>.*);.*$`;
			const cookieHeaders = (req.headers['cookie'] as string[] | undefined ?? []);
			req.cookies
		})
	);
};

export const createPassportValidation = (tokenKey: TokenKey) => {
	logger.debug('Creating passport JWT validation strategy');
	const options: StrategyOptions = {
		secretOrKey: tokenKey.key,
		// TODO need to add cookie support as well
		jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
	};

	passport.use(
		new JwtStrategy(options, (payload, done) => {
			done(null, payload);
		})
	);
};
