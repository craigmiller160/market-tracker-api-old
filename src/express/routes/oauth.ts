import { RouteCreator } from './RouteCreator';
import { AccessToken, secure } from '../TokenValidation';
import { pipe } from 'fp-ts/function';
import {
	AuthCodeLoginResponse,
	prepareAuthCodeLogin
} from '../../services/auth/AuthCodeLogin';
import * as E from 'fp-ts/Either';
import * as TE from 'fp-ts/TaskEither';
import * as TEU from '../../function/TaskEitherUtils'
import * as T from 'fp-ts/Task';
import { authenticateWithAuthCode } from '../../services/auth/AuthCodeAuthentication';
import { getEmptyCookie } from '../../services/auth/Cookie';

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
			TE.chain((url) => TEU.tryCatch(() => new Promise<string>((resolve, reject) => {
				req.session.save((err) => {
					if (err) {
						console.log('SessionSaveFailed', err);
						reject(err);
					} else {
						console.log('SessionSaveSucceeded');
						resolve(url);
					}
				});
			}))),
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

	app.get('/oauth/authcode/code', (req, res, next) => {
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
		)()
	});

	app.get('/oauth/logout', (req, res, next) =>
		pipe(
			getEmptyCookie(),
			E.fold(
				(ex) => next(ex),
				(cookie) => {
					res.setHeader('Set-Cookie', cookie);
					res.status(200);
				}
			)
		)
	);
};
