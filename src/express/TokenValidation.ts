import {
	Strategy as JwtStrategy,
	ExtractJwt,
	StrategyOptions
} from 'passport-jwt';
import { TokenKey } from '../auth/TokenKey';
import passport from 'passport';
import { logger } from '../logger';
import { Express, NextFunction, Request, Response } from 'express';
import { match } from 'ts-pattern';

// TODO do I need tests for this?
// TODO customize unauthorized error

export interface AccessToken {
	readonly sub: string;
	readonly clientName: string;
	readonly firstName: string;
	readonly lastName: string;
	readonly userId: number;
	readonly userEmail: string;
	readonly roles: string[];
}

enum Method {
	GET = 'GET',
	POST = 'POST',
	PUT = 'PUT',
	DELETE = 'DELETE'
}

// TODO delete these
// Info {"name":"JsonWebTokenError","message":"jwt malformed"}
// Info {"name":"TokenExpiredError","message":"jwt expired","expiredAt":"2022-01-09T00:32:31.000Z"}

type Route = (req: Request, res: Response, next: NextFunction) => void;
export const secure =
	(fn: Route): Route =>
	(req, res, next) => {
		passport.authenticate(
			'jwt',
			{ session: false },
			(err: Error | undefined, user: AccessToken | boolean, info) => {
				console.log('Error', err);
				console.log('User', user);
				console.log('Info', JSON.stringify(info));
				return user;
			}
		)(req, res, next);
		fn(req, res, next);
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
