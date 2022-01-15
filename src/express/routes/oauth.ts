import { RouteCreator } from './RouteCreator';
import { AccessToken, secure } from '../TokenValidation';
import { pipe } from 'fp-ts/function';
import {
	AuthCodeLoginResponse,
	prepareAuthCodeLogin
} from '../../services/auth/AuthCodeLogin';
import * as TE from 'fp-ts/TaskEither';
import * as TEU from '../../function/TaskEitherUtils';
import * as T from 'fp-ts/Task';
import { authenticateWithAuthCode } from '../../services/auth/AuthCodeAuthentication';
import { logout } from '../../services/auth/Logout';

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

	app.post('/oauth/authcode/login', (req, res, next) => {
		pipe(
			prepareAuthCodeLogin(req),
			TE.fromEither,
			TE.chain((url) =>
				TEU.tryCatch(
					() =>
						// TODO once it is working, see if this is actually doing anything
						new Promise<string>((resolve, reject) => {
							req.session.save((err) => {
								if (err) {
									reject(err);
								} else {
									resolve(url);
								}
							});
						})
				)
			),
			TE.fold(
				(ex) => {
					next(ex);
					return T.of('');
				},
				(url) => {
					const response: AuthCodeLoginResponse = {
						url
					};
					res.json(response);
					return T.of('');
				}
			)
		)();
	});

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
					res.end();
					return T.of('');
				}
			)
		)()
	);

	// TODO logout is not working for some reason
	app.get(
		'/oauth/logout',
		secure((req, res, next) =>
			pipe(
				logout(req),
				TE.fold(
					(ex) => {
						next(ex);
						return T.of('');
					},
					(cookie) => {
						res.setHeader('Set-Cookie', cookie);
						res.status(204);
						res.end();
						return T.of('');
					}
				)
			)()
		)
	);
};
