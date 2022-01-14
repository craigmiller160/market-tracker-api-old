import { RouteCreator } from './RouteCreator';
import { AccessToken, secure } from '../TokenValidation';
import { pipe } from 'fp-ts/function';
import {
	AuthCodeLoginResponse,
	prepareAuthCodeLogin
} from '../../services/auth/AuthCodeLogin';
import * as E from 'fp-ts/Either';
import * as TE from 'fp-ts/TaskEither';
import * as T from 'fp-ts/Task';
import { authenticateWithAuthCode } from '../../services/auth/AuthCodeAuthentication';

export const createOAuthRoutes: RouteCreator = (app) => {
	app.get(
		'/oauth/user',
		secure((req, res) => {
			const token = req.user as AccessToken;
			res.send({
				sub: token.sub,
				clientName: token.clientName,
				firstName: token.firstName,
				lastName: token.lastName,
				userId: token.userId,
				userEmail: token.userEmail,
				roles: token.roles
			});
		})
	);

	app.post('/oauth/authcode/login', (req, res, next) =>
		pipe(
			prepareAuthCodeLogin(req),
			E.fold(
				(ex) => next(ex),
				(url) => {
					const response: AuthCodeLoginResponse = {
						url
					};
					res.json(response);
				}
			)
		)
	);

	app.get('/oauth/authcode/code', (req, res, next) =>
		pipe(
			authenticateWithAuthCode(req),
			TE.fold(
				(ex) => {
					next(ex);
					return T.of('');
				},
				(authCodeSuccess) => {
					res.setHeader('Set-Cookie', authCodeSuccess.cookie);
					res.setHeader('Location', authCodeSuccess.postAuthRedirect);
					res.status(302);
					return T.of('');
				}
			)
		)
	);

	app.get('/oauth/logout', () => {
		throw new Error('Finish this');
	});
};
