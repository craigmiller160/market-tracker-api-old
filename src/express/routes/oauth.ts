import { RouteCreator } from './RouteCreator';
import { AccessToken, secure } from '../TokenValidation';
import { pipe } from 'fp-ts/function';
import { prepareAuthCodeLogin } from '../../services/auth/AuthCodeLogin';
import * as E from 'fp-ts/Either';

export interface AuthCodeLoginResponse {
	readonly url: string;
}

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
};
